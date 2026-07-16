import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameEntity, PlayerGameEntity } from 'libs/index';
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

const COLUMNS: { field: keyof GameEntity; name: string; sort: boolean }[] = [
  { field: 'dateSortOrder', name: 'Date', sort: true },
  { field: 'BoardGame', name: 'Game', sort: true },
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

  filterTable(table: Table, filter: Event): void {
    table.filterGlobal((filter.target as HTMLInputElement).value, 'contains');
  }

  filterColumns(games: GameEntity[]) {
    return COLUMNS.filter((col) =>
      games.some((row) => {
        const data = row[col.field];
        if (col.field === 'HighScore') {
          return this.showScore(row) && !!data;
        } else {
          return Array.isArray(data) ? data.length > 0 : !!data;
        }
      }),
    );
  }

  showScore(game: GameEntity): boolean {
    return game.BoardGame?.ScoreType === 'points';
  }

  getTrophyColor(playerGame: PlayerGameEntity): string {
    if (playerGame.Game?.BoardGame?.ScoreType === 'rank') {
      if (playerGame.Points === 0) {
        return 'gold';
      } else if (playerGame.Points === 1) {
        return 'silver';
      } else {
        return 'chocolate';
      }
    } else {
      return 'gold';
    }
  }

  canAdjustOrder(table: Table): boolean {
    return table.sortField === 'dateSortOrder' && table.sortOrder === -1;
  }
}
