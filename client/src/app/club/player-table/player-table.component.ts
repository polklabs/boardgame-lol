import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PipeModule } from '../../shared/pipes/pipe.module';
import { Observable } from 'rxjs';
import { GameEntity, PlayerEntity } from 'libs/index';
import { TrophyService } from '../../shared/services/trophy.service';
import { ITrophy } from '../../shared/trophies/trophy.model';

@Component({
  selector: 'app-player-table',
  imports: [TableModule, ButtonModule, PipeModule, CommonModule],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss',
})
export class PlayerTableComponent {
  @Input() players$?: Observable<PlayerEntity[]>;
  @Input() canEdit = false;

  @Output() playerEdit = new EventEmitter<PlayerEntity>();

  mostWins: ITrophy;

  expandedRows = {};
  playerColumns = [
    { field: 'Name', name: 'Name', sort: true },
    { field: 'Wins.length', name: 'Wins', sort: true },
    { field: '', name: 'Best Game(s)', sort: false },
    { field: 'BestGameWins', name: 'Best Game(s) Wins', sort: true },
    { field: 'FirstSeen', name: 'First Seen', sort: true },
  ];

  constructor(trophyService: TrophyService) {
    this.mostWins = trophyService.getTrophy('MostWins');
  }

  showScore(game: GameEntity): boolean {
    return game.BoardGame?.ScoreType === 'points';
  }
}
