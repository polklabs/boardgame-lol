import { AfterViewInit, Component, computed, inject, input, Signal } from '@angular/core';
import { StatsTableComponent, StatsTableItem } from '../../shared/components/stats-table/stats-table.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { Column } from '../../shared/models/column.model';
import { BoardGameEntity, WinCount } from 'libs/index';
import { TrophyListComponent } from '../../club/trophy-list/trophy-list.component';
import { getTagColumns } from '../../shared/helpers/data.helper';
import { DetailService } from '../../shared/services/detail.service';
import { ApiService } from '../../shared/services/api.service';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-board-game-detail',
  imports: [StatsTableComponent, TableComponent, TrophyListComponent, DialogComponent],
  templateUrl: './board-game-detail.component.html',
  styleUrl: './board-game-detail.component.scss',
})
export class BoardGameDetailComponent implements AfterViewInit {
  detailService = inject(DetailService);
  api = inject(ApiService);

  readonly boardGame = input<BoardGameEntity>();

  visible = false;

  stats: Signal<StatsTableItem[]> = computed(() => {
    const bg = this.boardGame();
    if (bg) {
      return [
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
        { title: 'Tags', content: bg.Tags.filter((t) => !t.Category) },
        ...getTagColumns<BoardGameEntity>('DisplayOnBoardGames').map((x) => ({
          title: x.name ?? x.id,
          content: (x.fieldFunc?.(bg) as unknown[]) ?? [],
        })),
      ];
    } else {
      return [];
    }
  });

  columns: Column<WinCount>[] = [
    { id: 'name', sort: true, dataType: 'text' },
    { id: 'wins', sort: true, dataType: 'number' },
    { id: 'losses', sort: true, dataType: 'number' },
    { id: 'winPercent', name: 'Win %', sort: true, dataType: 'number', suffix: '%' },
    { id: 'totalPoints', name: 'Total Points', sort: true, dataType: 'score', boardGame: (row) => row.boardGame },
    { id: 'nonScoreCount', name: 'Non-Scoring', sort: true, dataType: 'number' },
    { id: 'tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnPlayers'),
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.visible = true;
    }, 50);
  }

  rowClicked(winCount: WinCount) {
    const player = this.api.players.getOne(winCount.playerId);
    if (player) {
      this.detailService.showDetail(player);
    } else {
      // Continue
    }
  }
}
