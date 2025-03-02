import { Component, Input, OnChanges } from '@angular/core';
import { StatsModel } from '../../shared/models/stats.model';
import { CommonModule } from '@angular/common';
import { PipeModule } from '../../shared/pipes/pipe.module';
import { addDays, addYears, format } from 'date-fns';
import { ApiService } from '../../shared/services/api.service';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import autocolors from 'chartjs-plugin-autocolors';
import { ScoreTypeMapping, ScoreTypes } from 'libs/index';

type DayItem = { color: string; tooltip: string; icon?: string };

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [TooltipModule, PipeModule, ChartModule, CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnChanges {
  @Input() stats?: StatsModel;

  heatmap: { days: DayItem[]; month: string }[] = [];
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

  constructor(private apiService: ApiService) {}

  ngOnChanges(): void {
    this.updateHeatmap();
    this.generateWinsOverTimeChart();
    this.generateRankOverTimeChart();
    this.generateCountByDayChart();
    this.generateCountByMonthChart();
    this.ShowCharts = true;
  }

  updateHeatmap() {
    this.heatmap = [];

    const today = new Date();
    let date = addYears(today, -1);
    if (date.getDay() !== 0) {
      date = addDays(date, 7 - date.getDay());
    } else {
      // Continue
    }

    let currentMonth = '';
    // eslint-disable-next-line no-constant-condition
    while (date <= today) {
      const week: DayItem[] = [];

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
      if (month !== currentMonth) {
        currentMonth = month;
      } else {
        month = '';
      }
      this.heatmap.push({ days: week, month });
    }
  }

  getHeatmapColor(count: number) {
    const division = (this.stats?.MostPlaysOneDay ?? 0) / 5;

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

    let endDate = new Date(gameList[gameList.length - 1].Date);
    endDate = new Date(endDate.getTime() + userTimezoneOffset);

    while (date <= endDate) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const winners = gameList
        .filter((x) => x.Date === dateStr)
        .map((x) => x.Winners)
        .flat()
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

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.winsOverTimeData = {
      labels: winDates,
      datasets: [],
    };

    Object.keys(wins).forEach((pId) => {
      this.winsOverTimeData.datasets.push({
        label: players.find((x) => x.PlayerId === pId)?.Name ?? 'Unknown',
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
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
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
        .map((x) => x.Winners)
        .flat()
        .map((x) => x.PlayerId);

      players.forEach((p) => {
        wins[p.PlayerId ?? ''].push(
          (wins[p.PlayerId ?? ''][wins[p.PlayerId ?? ''].length - 1] ?? 0) +
            winners.reduce((count, w) => count + (w === p.PlayerId ? 1 : 0), 0),
        );
      });

      rankDates.push(dateStr);
    });

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.rankOverTimeData = {
      labels: rankDates,
      datasets: [],
    };

    const playerIds = Object.keys(wins);

    for (let i = 0; i < rankDates.length; i++) {
      const order = playerIds.map((pId) => ({ id: pId, count: wins[pId][i] })).sort((a, b) => b.count - a.count);
      playerIds.forEach((pId) => {
        wins[pId][i] = order.findIndex((x) => x.id === pId);
        wins[pId][i] = wins[pId][i] >= 4 ? 4 : wins[pId][i];
      });
    }

    playerIds.forEach((pId) => {
      this.rankOverTimeData.datasets.push({
        label: players.find((x) => x.PlayerId === pId)?.Name ?? 'Unknown',
        data: wins[pId],
        fill: false,
        // borderColor: documentStyle.getPropertyValue('--blue-500'),
        tension: 0.4,
      });
    });

    this.rankOverTimeOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
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
            color: surfaceBorder,
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

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

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
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
            stepSize: 1,
          },
          grid: {
            color: surfaceBorder,
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

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

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
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
            stepSize: 1,
          },
          grid: {
            color: surfaceBorder,
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
