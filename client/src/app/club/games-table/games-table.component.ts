import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameEntity } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ArrayPipe } from '../../shared/pipes/array.pipe';
import { ScorePipe } from '../../shared/pipes/score.pipe';
import { TagComponent } from '../../shared/components/tag/tag.component';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';
import { format, isSameYear } from 'date-fns';

const COLUMNS: { field: string; name: string; sort: boolean }[] = [
  { field: 'dateSortOrder', name: 'Date', sort: true },
  { field: 'BoardGame.Name', name: 'Game', sort: true },
  { field: 'WinnerTeams', name: 'Winner(s)', sort: false },
  { field: 'HighScore', name: 'Points', sort: true },
  { field: 'Players', name: 'Players', sort: true },
  { field: 'Tags', name: 'Tags', sort: true },
];

@Component({
  selector: 'app-games-table',
  imports: [
    TableModule,
    TagModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    IconFieldModule,
    InputIconModule,
    ArrayPipe,
    ScorePipe,
    TagComponent,
    TrophyIconComponent,
  ],
  templateUrl: './games-table.component.html',
  styleUrl: './games-table.component.scss',
})
export class GamesTableComponent {
  @Input() games$?: Observable<GameEntity[]>;
  @Input() canEdit = false;

  @Output() gameEdit = new EventEmitter<GameEntity>();
  @Output() moveUp = new EventEmitter<GameEntity>();
  @Output() moveDown = new EventEmitter<GameEntity>();

  expandedRows = {};

  filterColumns(games: GameEntity[]) {
    return COLUMNS.filter((col) =>
      games.some((row) => {
        if (col.field.includes('.')) {
          return true;
        } else {
          const data = row[col.field as keyof GameEntity];
          if (col.field === 'HighScore') {
            return this.showScore(row) && !!data;
          } else {
            return Array.isArray(data) ? data.length > 0 : !!data;
          }
        }
      }),
    );
  }

  showScore(game: GameEntity): boolean {
    return game.BoardGame?.ScoreType === 'points';
  }

  showYearRow(table: Table, games: GameEntity[], index: number) {
    if (table.sortOrder === 1) {
      index = games.length - index;
    } else {
      // Continue
    }
    return (
      table.sortField === 'dateSortOrder' &&
      !isSameYear(games.at(index - 1)?.DateObj ?? 0, games.at(index)?.DateObj ?? 0)
    );
  }

  getYearText(game: GameEntity) {
    return format(game.DateObj, 'yyyy');
  }

  canAdjustOrder(table: Table, games: GameEntity[], index: number): boolean {
    if (table.sortField === 'dateSortOrder' && table.sortOrder === -1) {
      return games.at(index - 1)?.Date === games[index].Date || games.at(index + 1)?.Date === games[index].Date;
    } else {
      return false;
    }
  }

  canAdjustDown(games: GameEntity[], index: number): boolean {
    return games.at(index + 1)?.Date === games[index].Date;
  }

  canAdjustUp(games: GameEntity[], index: number): boolean {
    return games.at(index - 1)?.Date === games[index].Date;
  }
}
