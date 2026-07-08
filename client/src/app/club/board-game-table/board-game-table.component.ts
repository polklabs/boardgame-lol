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
      wins: number;
      plays: number;
      winPercent: number;
    }[];
  } = {};

  expandedRows = {};
  boardGameColumns = [
    { field: 'Name', name: 'Game', sort: true },
    { field: 'Games.length', name: 'Plays', sort: true, width: 0 },
    { field: 'ChampionWins', name: 'Champion(s)', sort: true },
    { field: 'MaxPlayers', name: 'Max Player Count', sort: true, width: 0 },
    { field: 'AveragePlayers', name: 'Average Player Count', sort: true, width: 0 },
    { field: 'MaxScore', name: 'High Score', sort: false, width: 0 },
    { field: 'AverageScore', name: 'Average Score', sort: false, width: 0 },
    { field: 'AverageWinningScore', name: 'Average Winning Score', sort: false },
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
      const wonGames = new Set(player.Wins.map((w) => w.PlayerGameId));
      player.PlayerGames.forEach((pg) => {
        const boardGameId = pg.Game?.BoardGameId ?? '';
        if (this.WinCounts[boardGameId] === undefined) {
          this.WinCounts[boardGameId] = [];
        } else {
          // Continue
        }

        const winRow = this.WinCounts[boardGameId].find((x) => x.playerId === player.PlayerId);
        const won = wonGames.has(pg.PlayerGameId);

        if (winRow) {
          winRow.wins += won ? 1 : 0;
          winRow.plays++;
          winRow.winPercent = (winRow.wins / winRow.plays) * 100;
        } else {
          this.WinCounts[boardGameId].push({
            playerId: player.PlayerId ?? '',
            name: player.Name ?? 'Unknown',
            wins: won ? 1 : 0,
            plays: 1,
            winPercent: won ? 100 : 0,
          });
        }
      });
    });

    Object.values(this.WinCounts).forEach((count) => {
      count.sort((a, b) => b.wins - a.wins || b.winPercent - a.winPercent || a.name.localeCompare(b.name));
    });
  }
}
