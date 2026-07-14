import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { Popover, PopoverModule } from 'primeng/popover';
import { Observable, Subscription } from 'rxjs';
import { SortPipe } from '../../shared/pipes/sort.pipe';
import { ApiService } from '../../shared/services/api.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-filter',
  imports: [
    PopoverModule,
    BadgeModule,
    SortPipe,
    FloatLabelModule,
    MultiSelectModule,
    FormsModule,
    ButtonModule,
    AsyncPipe,
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent implements OnInit, OnDestroy {
  apiService = inject(ApiService);

  ogBoardGames$ = this.apiService.boardGameList$;
  ogPlayers$ = this.apiService.playerList$;
  tags$ = this.apiService.tagList$;

  dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  excludeTagIds: string[] = [];
  gameIds: string[] = [];
  playerIds: string[] = [];
  daysOfWeek = [...this.dow];
  months: string[] = [];
  startDate: Date | null = null;

  filterEnabled$: Observable<boolean> = this.apiService.filterEnabled$;

  subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.apiService.dataUpdate$.subscribe(() => {
        this.gameIds = this.apiService.boardGameList$.value.map((x) => x.BoardGameId);
        this.playerIds = this.apiService.playerList$.value.map((x) => x.PlayerId);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  enableFilter(filter: Popover) {
    filter.hide();
    this.apiService.filter(true, this.playerIds, this.gameIds, this.daysOfWeek, this.excludeTagIds);
  }

  disableFilter(filter: Popover) {
    filter.hide();
    this.apiService.filter(false, [], [], [], []);
  }
}
