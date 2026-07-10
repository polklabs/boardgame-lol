import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addDays, addYears, format } from 'date-fns';
import { ApiService } from '../../shared/services/api.service';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import autocolors from 'chartjs-plugin-autocolors';
import { ScoreTypeMapping, ScoreTypes } from 'libs/index';
import { ITrophy, Trophy } from '../../shared/trophies/trophy.model';
import { Subscription } from 'rxjs';
import { TrophyService } from '../../shared/services/trophy.service';
import { ArrayPipe } from '../../shared/pipes/array.pipe';

type DayItem = { color: string; tooltip: string; icon?: string };

@Component({
  selector: 'app-stats',
  imports: [TooltipModule, ChartModule, CommonModule, ArrayPipe],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnInit {
  private apiService = inject(ApiService);
  private trophyService = inject(TrophyService);

  heatmap: { days: DayItem[]; month: string; key: string }[] = [];
  colors = ['#1C2532', '#0E4429', '#006D32', '#26A641', '#39D353'];

  ShowCharts = false;
  // Chart.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  winsOverTimeData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  winsOverTimeOptions: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rankOverTimeData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rankOverTimeOptions: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countByDayData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countByDayOptions: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countByMonthData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countByMonthOptions: any;

  chartPlugins = [autocolors];

  trophies: Trophy[] = [];

  private textColor = '--p-text-color';
  private textColorSecondary = '--p-surface-50';
  private surfaceBorder = 'transparent';

  subscriptions = new Subscription();

  ngOnInit(): void {
    this.calculateChartColors();
    this.subscriptions.add(
      this.apiService.dataUpdate$.subscribe(() => {
        this.generateWinsOverTimeChart();
        this.generateRankOverTimeChart();
        this.generateCountByDayChart();
        this.generateCountByMonthChart();
        this.ShowCharts = this.apiService.gameList.length > 0;
      }),
    );
    this.subscriptions.add(
      this.trophyService.trophies$.subscribe((t) => {
        this.updateHeatmap();
        this.calculateTrophies(t);
      }),
    );
  }

  calculateChartColors() {
    const documentStyle = getComputedStyle(document.documentElement);
    this.textColor = documentStyle.getPropertyValue(this.textColor);
    this.textColorSecondary = documentStyle.getPropertyValue(this.textColorSecondary);
  }

  calculateTrophies(trophies: ITrophy[]) {
    this.trophies = trophies
      .map((x) => x.export())
      .filter((x) => x.array.length > 0 && x.array.length <= 2 && x.value !== Math.abs(Infinity));
    this.trophies.sort((a, b) => {
      return b.value - a.value;
    });
    this.trophies = this.trophies.slice(0, 9);
  }

  updateHeatmap() {
    this.heatmap = [];

    const today = new Date();
    let date = addYears(today, -1);
    if (date.getDay() === 0) {
      // Continue
    } else {
      date = addDays(date, 7 - date.getDay());
    }

    let currentMonth = '';
    // eslint-disable-next-line no-constant-condition
    while (date <= today) {
      const week: DayItem[] = [];
      const key = format(date, 'yyyy MM d');

      for (let d = 0; d < 7; d++) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dateText = format(date, 'MMMM do');

        const count = this.apiService.gameList.reduce((count, game) => count + (game.Date === dateStr ? 1 : 0), 0);
        week.push({ color: this.getHeatmapColor(count), tooltip: `${count} games on ${dateText}` });
        date = addDays(date, 1);
        if (date > today) {
          break;
        } else {
          // Continue
        }
      }

      let month = format(date > today ? addDays(date, -1) : date, 'MMM');
      if (month === currentMonth) {
        month = '';
      } else {
        currentMonth = month;
      }
      this.heatmap.push({ days: week, month, key });
    }
  }

  getHeatmapColor(count: number) {
    const mostPlays = this.trophyService.getTrophy('MostPlaysOneDay').value;
    const division = Math.max(mostPlays / 5, 1);

    let section = division;
    let index = 0;
    while (count > section) {
      section += division;
      index++;
    }
    if (count > 0 && index === 0) {
      index++;
    } else {
      // Continue
    }

    return this.colors[index];
  }

  generateWinsOverTimeChart() {
    const wins: { [playerId: string]: number[] } = {};
    const winDates: string[] = [];

    if (this.apiService.gameList.length === 0) {
      return;
    } else {
      // Continue
    }

    const gameList = this.apiService.gameList;
    const players = this.apiService.playerList.filter((x) => x.IsRealPerson && x.Wins.length > 0);

    players.forEach((p) => {
      wins[p.PlayerId ?? ''] = [];
    });

    let date = new Date(gameList[0].Date);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    date = new Date(date.getTime() + userTimezoneOffset);

    let endDate = new Date(gameList.at(-1)!.Date);
    endDate = new Date(endDate.getTime() + userTimezoneOffset);

    while (date <= endDate) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const winners = gameList
        .filter((x) => x.Date === dateStr)
        .flatMap((x) => x.Winners)
        .map((x) => x.PlayerId);

      players.forEach((p) => {
        wins[p.PlayerId ?? ''].push(
          (wins[p.PlayerId ?? ''][wins[p.PlayerId ?? ''].length - 1] ?? 0) +
            winners.reduce((count, w) => count + (w === p.PlayerId ? 1 : 0), 0),
        );
      });

      winDates.push(dateStr);

      date = addDays(date, 1);
    }

    this.winsOverTimeData = {
      labels: winDates,
      datasets: [],
    };

    Object.keys(wins).forEach((pId) => {
      this.winsOverTimeData.datasets.push({
        label: players.find((x) => x.PlayerId === pId)?.Nickname ?? 'Unknown',
        data: wins[pId],
        fill: false,
        // borderColor: documentStyle.getPropertyValue('--blue-500'),
        tension: 0.4,
      });
    });

    this.winsOverTimeOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: this.textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: this.textColorSecondary,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: this.textColorSecondary,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
      },
      elements: {
        point: {
          pointStyle: false,
        },
      },
    };
  }

  generateRankOverTimeChart() {
    const wins: { [playerId: string]: number[] } = {};
    const rankDates: string[] = [];

    if (this.apiService.gameList.length === 0) {
      return;
    } else {
      // Continue
    }

    const gameList = this.apiService.gameList;
    const players = this.apiService.playerList.filter((x) => x.IsRealPerson && x.Wins.length > 0);

    players.forEach((p) => {
      wins[p.PlayerId ?? ''] = [];
    });

    const dates = [...new Set(gameList.map((x) => `${x.Date}`))].sort((a, b) => a.localeCompare(b));

    dates.forEach((dateStr) => {
      const winners = gameList
        .filter((x) => x.Date === dateStr)
        .flatMap((x) => x.Winners)
        .map((x) => x.PlayerId);

      players.forEach((p) => {
        wins[p.PlayerId ?? ''].push(
          (wins[p.PlayerId ?? ''][wins[p.PlayerId ?? ''].length - 1] ?? 0) +
            winners.reduce((count, w) => count + (w === p.PlayerId ? 1 : 0), 0),
        );
      });

      rankDates.push(dateStr);
    });

    this.rankOverTimeData = {
      labels: rankDates,
      datasets: [],
    };

    const playerIds = Object.keys(wins);

    for (let i = 0; i < rankDates.length; i++) {
      const order = playerIds.map((pId) => ({ id: pId, count: wins[pId][i] })).sort((a, b) => b.count - a.count);
      playerIds.forEach((pId) => {
        wins[pId][i] = order.findIndex((x) => x.id === pId);
        wins[pId][i] = Math.min(wins[pId][i], 4);
      });
    }

    playerIds.forEach((pId) => {
      this.rankOverTimeData.datasets.push({
        label: players.find((x) => x.PlayerId === pId)?.Nickname ?? 'Unknown',
        data: wins[pId],
        fill: false,
        tension: 0.4,
      });
    });

    this.rankOverTimeOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: this.textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: this.textColorSecondary,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: this.textColorSecondary,
            stepSize: 1,
            callback: (label: number) => {
              if (label === 0) {
                return '1st';
              } else if (label === 1) {
                return '2nd';
              } else if (label === 2) {
                return '3rd';
              } else if (label === 3) {
                return '4th';
              } else {
                return '5th+';
              }
            },
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
      },
      elements: {
        point: {
          pointStyle: false,
        },
      },
    };
  }

  generateCountByDayChart() {
    const counts: { [scoreType: string]: { [day: string]: number } } = {};
    const countDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (this.apiService.gameList.length === 0) {
      return;
    } else {
      // Continue
    }

    const gameList = this.apiService.gameList;

    ScoreTypes.forEach((st) => (counts[st] = {}));
    const today = new Date();
    const date = addYears(today, -1);

    gameList.forEach((game) => {
      if (game.DateObj >= date) {
        const day = format(game.DateObj, 'eeee');
        if (counts[game.BoardGame?.ScoreType ?? ''][day] === undefined) {
          counts[game.BoardGame?.ScoreType ?? ''][day] = 1;
        } else {
          counts[game.BoardGame?.ScoreType ?? ''][day]++;
        }
      } else {
        // Skip
      }
    });

    this.countByDayData = {
      labels: countDays,
      datasets: [],
    };

    ScoreTypes.forEach((st) =>
      this.countByDayData.datasets.push({
        label: ScoreTypeMapping[st],
        data: countDays.map((d) => counts[st][d] ?? 0),
        fill: false,
        // borderColor: documentStyle.getPropertyValue('--blue-500'),
        tension: 0.4,
      }),
    );

    this.countByDayOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: this.textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: this.textColorSecondary,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: this.textColorSecondary,
            stepSize: 1,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
      },
      elements: {
        point: {
          pointStyle: false,
        },
      },
    };
  }

  generateCountByMonthChart() {
    const counts: { [scoreType: string]: { [month: string]: number } } = {};
    const countMonths: string[] = [];

    if (this.apiService.gameList.length === 0) {
      return;
    } else {
      // Continue
    }

    const today = new Date();
    const date = addYears(today, -1);

    const gameList = this.apiService.gameList;

    ScoreTypes.forEach((st) => (counts[st] = {}));

    gameList.forEach((game) => {
      if (game.DateObj >= date) {
        const month = format(game.DateObj, 'MMM yyyy');
        if (countMonths.includes(month) === false) {
          countMonths.push(month);
        } else {
          // Continue
        }
        const scoreTypeCount = counts[game.BoardGame?.ScoreType ?? ''];
        if (scoreTypeCount[month] === undefined) {
          scoreTypeCount[month] = 1;
        } else {
          scoreTypeCount[month]++;
        }
      } else {
        // Skip
      }
    });

    this.countByMonthData = {
      labels: countMonths,
      datasets: [],
    };

    ScoreTypes.forEach((st) =>
      this.countByMonthData.datasets.push({
        label: ScoreTypeMapping[st],
        data: countMonths.map((d) => counts[st][d] ?? 0),
        fill: false,
        // borderColor: documentStyle.getPropertyValue('--blue-500'),
        tension: 0.4,
      }),
    );

    this.countByMonthOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: this.textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: this.textColorSecondary,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: this.textColorSecondary,
            stepSize: 1,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
      },
      elements: {
        point: {
          pointStyle: false,
        },
      },
    };
  }
}
