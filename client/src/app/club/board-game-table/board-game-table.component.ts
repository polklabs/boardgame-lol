import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BoardGameEntity, PlayerEntity, PlayerGameEntity, TagEntity } from 'libs/index';
import { TrophyService } from '../../shared/services/trophy.service';
import { HidePipe } from '../../shared/pipes/hide.pipe';
import { ArrayPipe } from '../../shared/pipes/array.pipe';
import { TagModule } from 'primeng/tag';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';

type WinCount = {
  playerId: string;
  tags: TagEntity[];
  name: string;
  wins: number;
  plays: number;
  winPercent: number;
  totalPoints?: number;
  boardGame: BoardGameEntity | null | undefined;
};

@Component({
  selector: 'app-board-game-table',
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
    HidePipe,
    ArrayPipe,
    TableComponent,
    TemplateIdDirective,
  ],
  templateUrl: './board-game-table.component.html',
  styleUrl: './board-game-table.component.scss',
})
export class BoardGameTableComponent implements OnChanges {
  trophyService = inject(TrophyService);
  cdr = inject(ChangeDetectorRef);

  @Input() boardGames$?: Observable<BoardGameEntity[]>;
  @Input() players: PlayerEntity[] | null = null;
  @Input() canEdit = false;

  @Output() boardGameEdit = new EventEmitter<BoardGameEntity>();

  WinCounts: {
    [boardGameId: string]: WinCount[];
  } = {};

  columns: Column<BoardGameEntity>[] = [
    { id: 'Name', name: 'Game', dataType: 'text', sort: true },
    { id: 'PlayCount', name: 'Plays', dataType: 'custom', sort: true },
    { id: 'ChampionWins', name: 'Champion(s)', dataType: 'custom', sort: true },
    { id: 'MaxPlayers', name: 'Max Players', dataType: 'number', sort: true },
    { id: 'AveragePlayers', name: 'Avg Players', dataType: 'decimal', sort: true },
    { id: 'MaxScore', name: 'High Score', dataType: 'score', boardGame: (row) => row },
    { id: 'AverageScore', name: 'Avg Score', dataType: 'score', boardGame: (row) => row },
    { id: 'AverageWinningScore', name: 'Avg Winning Score', dataType: 'score', boardGame: (row) => row },
    { id: 'Tags', dataType: 'tag' },
  ];

  expansionColumns: Column<WinCount>[] = [
    { id: 'name', sort: true, dataType: 'text' },
    { id: 'tags', dataType: 'tag' },
    { id: 'wins', sort: true, dataType: 'text' },
    { id: 'winPercent', name: 'Win %', sort: true, dataType: 'number', suffix: '%' },
    { id: 'totalPoints', name: 'Total Points', sort: true, dataType: 'score', boardGame: (row) => row.boardGame },
  ];

  mostPlays = this.trophyService.getTrophy('MostPlays');

  ngOnChanges(): void {
    if (this.players) {
      this.calculateWinCounts(this.players);
      this.cdr.detectChanges();
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
          winRow.totalPoints = this.getPoints(pg, winRow.totalPoints);
        } else {
          this.WinCounts[boardGameId].push({
            playerId: player.PlayerId,
            name: player.ShortName ?? 'Unknown',
            tags: player.Tags,
            wins: won ? 1 : 0,
            plays: 1,
            winPercent: won ? 100 : 0,
            totalPoints: this.getPoints(pg),
            boardGame: pg.Game?.BoardGame,
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
    return (this.WinCounts?.[boardGame.BoardGameId]?.length ?? 0) > 0;
  }
}
