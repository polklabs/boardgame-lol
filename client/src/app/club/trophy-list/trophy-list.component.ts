import { Component, inject, input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ITrophy } from '../../shared/trophies/trophy.model';
import { Subscription } from 'rxjs';
import { TrophyService } from '../../shared/services/trophy.service';
import { StatsTableComponent, StatsTableItem } from '../../shared/components/stats-table/stats-table.component';

@Component({
  selector: 'app-trophy-list',
  imports: [StatsTableComponent],
  templateUrl: './trophy-list.component.html',
  styleUrl: './trophy-list.component.scss',
})
export class TrophyListComponent implements OnInit, OnDestroy, OnChanges {
  trophyService = inject(TrophyService);

  readonly filter = input<unknown>();
  readonly smallHeader = input<boolean>(false);

  trophies: StatsTableItem[] = [];

  subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.trophyService.trophies$.subscribe((t) => {
        this.calculateTrophies(t);
      }),
    );
  }

  ngOnChanges(): void {
    this.calculateTrophies(this.trophyService.getTrophies());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  calculateTrophies(trophies: ITrophy[]) {
    this.trophies = trophies
      .map((x) => x.export())
      .filter((x) => x.array.length > 0 && x.array.length < 4 && Math.abs(x.value) !== Infinity)
      .filter((x) => (this.filter() ? x.array.includes(this.filter()) : true))
      .map((x) => ({
        emoji: x.emoji,
        tooltip: x.formula,
        title: x.title,
        subtitle: x.subtitle,
        content: x.showArray ? x.array : undefined,
        value: x.showValue ? x.value : undefined,
      }));
  }
}
