import { Component, input, OnChanges, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { StatsTableComponent, StatsTableItem } from '../../shared/components/stats-table/stats-table.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { DecimalPipe } from '@angular/common';
import { Column } from '../../shared/models/column.model';
import { BoardGameEntity } from 'libs/index';
import { WinCount } from '../../club/board-game-table/board-game-table.component';
import { TrophyListComponent } from '../../club/trophy-list/trophy-list.component';

@Component({
  selector: 'app-board-game-detail',
  imports: [DialogModule, StatsTableComponent, TableComponent, TemplateIdDirective, DecimalPipe, TrophyListComponent],
  templateUrl: './board-game-detail.component.html',
  styleUrl: './board-game-detail.component.scss',
})
export class BoardGameDetailComponent implements OnChanges {
  readonly boardGame = input<BoardGameEntity>();
  readonly winCount = input.required<WinCount[]>();
  readonly visible = input.required<boolean>();
  readonly closeDetails = output<void>();

  stats: StatsTableItem[] = [];

  columns: Column<WinCount>[] = [
    { id: 'name', sort: true, dataType: 'text' },
    { id: 'tags', dataType: 'tag' },
    { id: 'wins', sort: true, dataType: 'text' },
    { id: 'winPercent', name: 'Win %', sort: true, dataType: 'number', suffix: '%' },
    { id: 'totalPoints', name: 'Total Points', sort: true, dataType: 'score', boardGame: (row) => row.boardGame },
    { id: 'nonScoreCount', name: 'Non-Scoring', sort: true, dataType: 'number' },
  ];

  ngOnChanges(): void {
    const bg = this.boardGame();
    if (bg) {
      this.stats = [
        { title: 'Play Count', value: bg.PlayCount },
        { title: 'Champion', value: bg.ChampionWins, content: bg.Champions },
        {
          title: 'Players - Average',
          content: bg.PlayCount > 0 ? [`${bg.MinPlayers} - ${bg.MaxPlayers}`] : undefined,
          value: bg.AveragePlayers,
        },
        { title: 'Players - Unique', value: bg.UniquePlayers },
        { title: 'High Score', value: Math.abs(bg.MaxScore) !== Infinity ? bg.MaxScore : undefined },
        { title: 'Low Score', value: Math.abs(bg.MinScore) !== Infinity ? bg.MinScore : undefined },
        { title: 'Average Score', value: Math.abs(bg.AverageScore) !== Infinity ? bg.AverageScore : undefined },
        {
          title: 'Average Winning Score',
          value: Math.abs(bg.AverageWinningScore) !== Infinity ? bg.AverageWinningScore : undefined,
        },
        { title: 'Tags', content: bg.Tags.length > 0 ? bg.Tags : undefined },
      ];
    } else {
      this.stats = [];
    }
  }
}
