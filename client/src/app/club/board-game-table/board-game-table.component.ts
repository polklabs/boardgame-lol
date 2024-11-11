import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PipeModule } from '../../shared/pipes/pipe.module';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { StatsModel } from '../../shared/models/stats.model';
import { BoardGameEntity, PlayerEntity } from 'libs/index';

@Component({
  selector: 'app-board-game-table',
  standalone: true,
  imports: [TableModule, ButtonModule, PipeModule, CommonModule],
  templateUrl: './board-game-table.component.html',
  styleUrl: './board-game-table.component.scss',
})
export class BoardGameTableComponent implements OnChanges {
  @Input() boardGames$?: Observable<BoardGameEntity[]>;
  @Input() players: PlayerEntity[] | null = null;
  @Input() canEdit = false;
  @Input() stats?: StatsModel;

  @Output() boardGameEdit = new EventEmitter<BoardGameEntity>();

  WinCounts: {
    [boardGameId: string]: {
      playerId: string;
      name: string;
      count: number;
    }[];
  } = {};

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

  ngOnChanges(): void {
    if (this.players) {
      this.calculateWinCounts(this.players);
    } else {
      this.WinCounts = {};
    }
  }

  calculateWinCounts(players: PlayerEntity[]) {
    this.WinCounts = {};
    players.forEach((player) => {
      player.Wins.forEach((win) => {
        if (this.WinCounts[win.Game?.BoardGameId ?? ''] === undefined) {
          this.WinCounts[win.Game?.BoardGameId ?? ''] = [];
        } else {
          // Continue
        }

        const row = this.WinCounts[win.Game?.BoardGameId ?? ''].find((x) => x.playerId === player.PlayerId);
        if (row) {
          row.count++;
        } else {
          this.WinCounts[win.Game?.BoardGameId ?? ''].push({
            playerId: player.PlayerId ?? '',
            name: player.Name ?? 'Unknown',
            count: 1,
          });
        }
      });
    });

    Object.values(this.WinCounts).forEach((count) => {
      count.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    });
  }
}
