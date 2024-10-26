import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PipeModule } from '../../shared/pipes/pipe.module';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { StatsModel } from '../../shared/models/stats.model';
import { BoardGameEntity } from 'libs/index';

@Component({
  selector: 'app-board-game-table',
  standalone: true,
  imports: [TableModule, ButtonModule, PipeModule, CommonModule],
  templateUrl: './board-game-table.component.html',
  styleUrl: './board-game-table.component.scss',
})
export class BoardGameTableComponent {
  @Input() boardGames$?: Observable<BoardGameEntity[]>;
  @Input() canEdit = false;
  @Input() stats?: StatsModel;

  @Output() boardGameEdit = new EventEmitter<BoardGameEntity>();

  expandedRows = {};
  boardGameColumns = [
    { field: 'Name', name: 'Game', sort: true },
    { field: 'Games.length', name: 'Plays', sort: true, width: 0 },
    { field: 'ChampionWins', name: 'Champion(s)', sort: true },
    { field: 'ChampionWins', name: 'Wins', sort: true, width: 0 },
    { field: 'MaxPlayers', name: 'Max Player Count', sort: true, width: 0 },
    { field: 'AveragePlayers', name: 'Average Player Count', sort: true, width: 0 },
    { field: 'MaxScore', name: 'High Score', sort: true, width: 0 },
    { field: 'AverageScore', name: 'Average Score', sort: true, width: 0 },
    { field: 'AverageWinningScore', name: 'Average Winning Score', sort: true },
  ];
}
