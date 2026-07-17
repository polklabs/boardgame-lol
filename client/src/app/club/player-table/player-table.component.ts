import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { GameEntity, PlayerEntity } from 'libs/index';
import { TrophyService } from '../../shared/services/trophy.service';
import { ITrophy } from '../../shared/trophies/trophy.model';
import { HidePipe } from '../../shared/pipes/hide.pipe';
import { ArrayPipe } from '../../shared/pipes/array.pipe';
import { ScorePipe } from '../../shared/pipes/score.pipe';
import { TagModule } from 'primeng/tag';
import { TagComponent } from '../../shared/components/tag/tag.component';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';

const COLUMNS: { field: keyof PlayerEntity; name: string; sort: boolean }[] = [
  { field: 'Name', name: 'Name', sort: true },
  { field: 'WinCount', name: 'Wins', sort: true },
  { field: 'LossCount', name: 'Losses', sort: true },
  { field: 'BestGames', name: 'Best Game(s)', sort: false },
  { field: 'BestGameWins', name: 'Best Game(s) Wins', sort: true },
  { field: 'FirstSeen', name: 'First Seen', sort: true },
  { field: 'Tags', name: 'Tags', sort: false },
];

@Component({
  selector: 'app-player-table',
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
    HidePipe,
    ArrayPipe,
    ScorePipe,
    TagComponent,
    TrophyIconComponent,
  ],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss',
})
export class PlayerTableComponent {
  @Input() players$?: Observable<PlayerEntity[]>;
  @Input() canEdit = false;

  @Output() playerEdit = new EventEmitter<PlayerEntity>();

  mostWins: ITrophy;

  expandedRows = {};

  constructor() {
    const trophyService = inject(TrophyService);

    this.mostWins = trophyService.getTrophy('MostWins');
  }

  showScore(game: GameEntity): boolean {
    return game.BoardGame?.ScoreType === 'points';
  }

  filterColumns(players: PlayerEntity[]) {
    return COLUMNS.filter((col) =>
      players.some((row) => {
        const data = row[col.field];
        return Array.isArray(data) ? data.length > 0 : !!data;
      }),
    );
  }
}
