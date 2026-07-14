import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BoardGameEntity, PlayerEntity, PlayerGameEntity } from 'libs/index';
import { ITrophy } from '../../shared/trophies/trophy.model';
import { TrophyService } from '../../shared/services/trophy.service';
import { HidePipe } from '../../shared/pipes/hide.pipe';
import { ArrayPipe } from '../../shared/pipes/array.pipe';
import { ScorePipe } from '../../shared/pipes/score.pipe';
import { TagModule } from 'primeng/tag';
import { TagComponent } from "../../shared/components/tag/tag.component";

const COLUMNS: { field: keyof BoardGameEntity; name: string; sort: boolean }[] = [
  { field: 'Name', name: 'Game', sort: true },
  { field: 'PlayCount', name: 'Plays', sort: true },
  { field: 'ChampionWins', name: 'Champion(s)', sort: true },
  { field: 'MaxPlayers', name: 'Max Players', sort: true },
  { field: 'AveragePlayers', name: 'Avg Players', sort: true },
  { field: 'MaxScore', name: 'High Score', sort: false },
  { field: 'AverageScore', name: 'Average Score', sort: false },
  { field: 'AverageWinningScore', name: 'Average Winning Score', sort: false },
  { field: 'Tags', name: 'Tags', sort: false },
];

@Component({
  selector: 'app-board-game-table',
  imports: [TableModule, ButtonModule, TagModule, CommonModule, ScorePipe, HidePipe, ArrayPipe, TagComponent],
  templateUrl: './board-game-table.component.html',
  styleUrl: './board-game-table.component.scss',
})
export class BoardGameTableComponent implements OnChanges {
  @Input() boardGames$?: Observable<BoardGameEntity[]>;
  @Input() players: PlayerEntity[] | null = null;
  @Input() canEdit = false;

  @Output() boardGameEdit = new EventEmitter<BoardGameEntity>();

  WinCounts: {
    [boardGameId: string]: {
      playerId: string;
      name: string;
      wins: number;
      plays: number;
      winPercent: number;
      totalPoints?: number;
    }[];
  } = {};

  expandedRows = {};

  mostPlays: ITrophy;

  constructor() {
    const trophyService = inject(TrophyService);

    this.mostPlays = trophyService.getTrophy('MostPlays');
  }

  ngOnChanges(): void {
    if (this.players) {
      this.calculateWinCounts(this.players);
    } else {
      this.WinCounts = {};
    }
  }

  filterColumns(boardGames: BoardGameEntity[]) {
    return COLUMNS.filter((col) =>
      boardGames.some((row) => {
        const data = row[col.field];
        return Array.isArray(data) ? data.length > 0 : !!data;
      }),
    );
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
          winRow.totalPoints = this.getPoints(pg, winRow.totalPoints);
        } else {
          this.WinCounts[boardGameId].push({
            playerId: player.PlayerId,
            name: player.Name ?? 'Unknown',
            wins: won ? 1 : 0,
            plays: 1,
            winPercent: won ? 100 : 0,
            totalPoints: this.getPoints(pg),
          });
        }
      });
    });

    Object.values(this.WinCounts).forEach((count) => {
      count.sort((a, b) => b.wins - a.wins || b.winPercent - a.winPercent || a.name.localeCompare(b.name));
    });
  }

  getPoints(playerGame: PlayerGameEntity, curr?: number) {
    if (playerGame.Game?.BoardGame?.ScoreType === 'points') {
      return (curr ?? 0) + (playerGame.Points ?? 0);
    } else {
      return undefined;
    }
  }

  showExpansion(boardGame: BoardGameEntity) {
    return (this.WinCounts[boardGame.BoardGameId]?.length ?? 0) > 0;
  }
}
