import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BoardGameEntity, PlayerGameEntity, TagEntity } from 'libs/index';
import { TrophyService } from '../../shared/services/trophy.service';
import { HidePipe } from '../../shared/pipes/hide.pipe';
import { TagModule } from 'primeng/tag';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { getTagColumns } from '../../shared/helpers/data.helper';
import { MapPipe } from '../../shared/pipes/map.pipe';
import { BoardGameDetailComponent } from '../../details/board-game-detail/board-game-detail.component';

export type WinCount = {
  playerId: string;
  tags: TagEntity[];
  name: string;
  wins: number;
  nonScoreCount: number;
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
    TableComponent,
    TemplateIdDirective,
    MapPipe,
    BoardGameDetailComponent,
  ],
  templateUrl: './board-game-table.component.html',
  styleUrl: './board-game-table.component.scss',
})
export class BoardGameTableComponent implements OnChanges {
  trophyService = inject(TrophyService);

  @Input() boardGames: BoardGameEntity[] = [];
  @Input() canEdit = false;

  @Output() boardGameEdit = new EventEmitter<BoardGameEntity>();

  boardGameDetails?: BoardGameEntity;
  boardGameDetailsShow = false;

  WinCounts: {
    [boardGameId: string]: WinCount[];
  } = {};

  columns: Column<BoardGameEntity>[] = [
    { id: 'Name', name: 'Game', dataType: 'text', sort: true },
    { id: 'PlayCount', name: 'Plays', dataType: 'custom', sort: true },
    { id: 'ChampionWins', name: 'Champion(s)', dataType: 'custom', sort: true },
    { id: 'MinPlayers', name: 'Players', dataType: 'custom', sort: true },
    { id: 'MaxScore', name: 'High Score', dataType: 'score', boardGame: (row) => row, sort: true },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnBoardGames'),
  ];

  mostPlays = this.trophyService.getTrophy('MostPlays');

  ngOnChanges(): void {
    this.calculateWinCounts();
  }

  openBoardGameDetail(boardGame: BoardGameEntity) {
    this.boardGameDetails = boardGame;
    this.boardGameDetailsShow = true;
  }

  calculateWinCounts() {
    this.WinCounts = {};
    this.boardGames.forEach((bg) => {
      bg.Games.forEach((g) => {
        g.Scores.forEach((pg) => {
          pg.Players.forEach((p) => {
            const boardGameId = pg.Game?.BoardGameId ?? '';
            if (this.WinCounts[boardGameId] === undefined) {
              this.WinCounts[boardGameId] = [];
            } else {
              // Continue
            }

            const winRow = this.WinCounts[boardGameId].find((x) => x.playerId === p.PlayerId);
            const won = pg.Won;

            const played = pg.ScoringPlayer ? 1 : 0;

            if (winRow) {
              winRow.wins += won ? 1 : 0;
              winRow.plays += played;
              winRow.nonScoreCount += 1 - played;
              winRow.winPercent = winRow.plays > 0 ? (winRow.wins / winRow.plays) * 100 : 0;
              winRow.totalPoints = this.getPoints(pg, winRow.totalPoints);
            } else {
              this.WinCounts[boardGameId].push({
                playerId: p.PlayerId,
                name: p.ShortName,
                tags: p.Tags,
                wins: won ? 1 : 0,
                plays: played,
                winPercent: won ? 100 : 0,
                nonScoreCount: 1 - played,
                totalPoints: this.getPoints(pg),
                boardGame: pg.Game?.BoardGame,
              });
            }
          });
        });
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
