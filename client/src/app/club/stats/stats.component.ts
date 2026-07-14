import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addDays, addYears, format } from 'date-fns';
import { ApiService } from '../../shared/services/api.service';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import autocolors from 'chartjs-plugin-autocolors';
import { GameEntity, ScoreTypeMapping, ScoreTypes } from 'libs/index';
import { ITrophy, Trophy } from '../../shared/trophies/trophy.model';
import { Subscription } from 'rxjs';
import { TrophyService } from '../../shared/services/trophy.service';
import { ArrayPipe } from '../../shared/pipes/array.pipe';
import { ChartData, ChartOptions } from 'chart.js';
import { clone } from 'lodash-es';

type DayItem = { color: string; tooltip?: string; icon?: string };

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

  winsOverTimeData: ChartData = { labels: [], datasets: [] };
  winsOverTimeOptions?: ChartOptions;
  rankOverTimeData: ChartData = { labels: [], datasets: [] };
  rankOverTimeOptions?: ChartOptions;
  countByDayData: ChartData = { labels: [], datasets: [] };
  countByDayOptions?: ChartOptions;
  countByMonthData: ChartData = { labels: [], datasets: [] };
  countByMonthOptions?: ChartOptions;

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
        const [wins, dates] = this.generateWins();
        this.generateWinsOverTimeChart(wins, dates);
        this.generateRankOverTimeChart(wins, dates);
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
    this.trophies = trophies.map((x) => x.export()).filter((x) => x.array.length > 0 && x.value !== Math.abs(Infinity));
    // this.trophies = this.trophies.slice(0, 9);
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
        const dateText = format(date, 'MMMM do, yyyy');

        const count = this.apiService.gameList.reduce((count, game) => count + (game.Date === dateStr ? 1 : 0), 0);
        week.push({
          color: this.getHeatmapColor(count),
          tooltip: count > 0 ? `${count} game${count > 1 ? 's' : ''} on ${dateText}` : undefined,
        });
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

  generateWinsOverTimeChart(wins: Record<string, number[]>, dates: string[]) {
    if (dates.length <= 1) {
      return;
    } else {
      // Create chart
    }

    const lastYear = format(addYears(new Date(), -1), 'yyyy-MM-dd');
    const toDelete = dates.findIndex((d) => d > lastYear);

    wins = clone(wins);

    const pIds = Object.keys(wins);
    if (toDelete > 0) {
      dates = [lastYear, ...dates.slice(toDelete)];
      pIds.forEach((p) => {
        wins[p] = [wins[p][toDelete - 1], ...wins[p].slice(toDelete)];
      });
    } else {
      // Skip
    }

    this.winsOverTimeData = {
      labels: dates,
      datasets: [],
    };

    pIds.forEach((pId) => {
      this.winsOverTimeData.datasets.push({
        label: this.apiService.getPlayer(pId)?.Nickname ?? 'Unknown',
        data: wins[pId],
        fill: false,
        stepped: true,
        pointRadius: wins[pId].map((x, i) => (x !== wins[pId].at(i - 1) ? 4 : 0)),
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
        tooltip: {
          callbacks: {
            label: function (context) {
              const data = context.dataset.data as number[];
              if (context.dataIndex > 0) {
                const lastValue = data.at(context.dataIndex - 1) ?? 0;
                return `${context.dataset.label}: (+${+context.formattedValue - lastValue}) ${context.formattedValue} `;
              } else {
                return `${context.dataset.label}: ${context.formattedValue}`;
              }
            },
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
          },
        },
        y: {
          ticks: {
            color: this.textColorSecondary,
          },
          grid: {
            color: this.surfaceBorder,
          },
        },
      },
    };
  }

  generateRankOverTimeChart(wins: Record<string, number[]>, dates: string[]) {
    if (dates.length <= 1) {
      return;
    } else {
      // Create chart
    }

    const spots = 5;
    const ranks = ['5th', '4th', '3rd', '2nd', '1st'];

    const lastYear = format(addYears(new Date(), -1), 'yyyy-MM-dd');
    const toDelete = dates.findIndex((d) => d > lastYear);

    wins = clone(wins);

    let pIds = Object.keys(wins);
    if (toDelete > 0) {
      dates = [lastYear, ...dates.slice(toDelete)];
      pIds.forEach((p) => {
        wins[p] = [wins[p][toDelete - 1], ...wins[p].slice(toDelete)];
      });
    } else {
      // Skip
    }

    const maxValues = dates.map((_, i) =>
      pIds
        .map((id) => wins[id][i])
        .toSorted((a, b) => b - a)
        .slice(0, spots)
        .toReversed(),
    );

    pIds.forEach((id) => {
      wins[id] = wins[id].map((x, i) => Math.max(0, maxValues[i].lastIndexOf(x)));
      if (wins[id].every((x) => x <= 0)) {
        delete wins[id];
      } else {
        // Keep
      }
    });
    pIds = Object.keys(wins);

    this.rankOverTimeData = {
      labels: dates,
      datasets: [],
    };

    pIds.forEach((pId) => {
      this.rankOverTimeData.datasets.push({
        label: this.apiService.getPlayer(pId)?.Nickname ?? 'Unknown',
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
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${ranks[+context.formattedValue]}`;
            },
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
          },
        },
        y: {
          ticks: {
            color: this.textColorSecondary,
            callback: (label: string | number) => {
              return ranks[+label] ?? '';
            },
          },
          grid: {
            color: this.surfaceBorder,
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

  generateWins(): [Record<string, number[]>, string[]] {
    const wins: Record<string, number[]> = {};

    if (this.apiService.gameList.length === 0) {
      return [{}, []];
    } else {
      // Continue
    }

    const pIds = this.apiService.playerList.filter((x) => x.IsRealPerson && x.Wins.length > 0).map((x) => x.PlayerId);

    const gameDayDict: Record<string, GameEntity[]> = {};
    const dateSet = new Set<string>();
    this.apiService.gameList.forEach((g) => {
      const dateStr = format(g.DateObj, 'yyyy-MM-dd');
      dateSet.add(dateStr);
      if (dateStr in gameDayDict) {
        gameDayDict[dateStr].push(g);
      } else {
        gameDayDict[dateStr] = [g];
      }
    });
    const dates = [...dateSet].sort((a, b) => a.localeCompare(b));

    pIds.forEach((p) => {
      wins[p] = [];
    });

    for (const date of dates) {
      const winners = gameDayDict[date]?.flatMap((x) => x.Winners).map((x) => x.PlayerId) ?? [];

      pIds.forEach((p) => {
        const v = winners.reduce((count, w) => count + (w === p ? 1 : 0), 0);
        wins[p].push((wins[p].at(-1) ?? 0) + v);
      });
    }

    return [wins, dates];
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

    gameList.forEach((game) => {
      const day = format(game.DateObj, 'eeee');
      if (counts[game.ScoreType][day] === undefined) {
        counts[game.ScoreType][day] = 1;
      } else {
        counts[game.ScoreType][day]++;
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

    const gameList = this.apiService.gameList;

    ScoreTypes.forEach((st) => (counts[st] = {}));

    gameList.forEach((game) => {
      const month = format(game.DateObj, 'MMM yyyy');
      if (countMonths.includes(month) === false) {
        countMonths.push(month);
      } else {
        // Continue
      }
      const scoreTypeCount = counts[game.ScoreType];
      if (scoreTypeCount[month] === undefined) {
        scoreTypeCount[month] = 1;
      } else {
        scoreTypeCount[month]++;
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
