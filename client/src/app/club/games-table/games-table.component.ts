import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameEntity, PlayerGameEntity } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { PipeModule } from '../../shared/pipes/pipe.module';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-games-table',
  standalone: true,
  imports: [TableModule, TagModule, InputTextModule, ButtonModule, CommonModule, PipeModule],
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
  gameColumns = [
    { field: 'dateSortOrder', name: 'Date', sort: true },
    { field: 'BoardGame.Name', name: 'Game', sort: true },
    { field: 'Players', name: 'Players', sort: true },
    { field: 'Winners', name: 'Winner(s)', sort: false },
    { field: 'HighScore', name: 'Points', sort: true },
    { field: 'DidNotFinish', name: 'Did Not Finish', sort: true },
  ];

  filterTable(table: Table, filter: Event): void {
    table.filterGlobal((filter.target as HTMLInputElement).value, 'contains');
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
}
