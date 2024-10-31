import { Component, Input, OnChanges } from '@angular/core';
import { StatsModel } from '../../shared/models/stats.model';
import { CommonModule } from '@angular/common';
import { PipeModule } from '../../shared/pipes/pipe.module';
import { addDays, addYears, format } from 'date-fns';
import { ApiService } from '../../shared/services/api.service';
import { TooltipModule } from 'primeng/tooltip';

type DayItem = { color: string; tooltip: string };

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [TooltipModule, PipeModule, CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnChanges {
  @Input() stats?: StatsModel;

  heatmap: { days: DayItem[]; month: string }[] = [];
  colors = ['#1C2532', '#0E4429', '#006D32', '#26A641', '#39D353'];

  constructor(private apiService: ApiService) {}

  ngOnChanges(): void {
    this.updateHeatmap();
  }

  updateHeatmap() {
    this.heatmap = [];

    const today = new Date();
    let date = addYears(today, -1);
    while (date.getDay() !== 0) {
      date = addDays(date, 1);
    }

    let currentMonth = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
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

        if (date > today) {
          break;
        } else {
          // Continue
        }
      }

      const month = format(date, 'MMM');
      if (month !== currentMonth) {
        currentMonth = month;
        this.heatmap.push({ days: week, month: month });
      } else {
        this.heatmap.push({ days: week, month: '' });
      }

      if (date > today) {
        break;
      } else {
        // Continue
      }
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
}
