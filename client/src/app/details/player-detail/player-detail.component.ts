import { AfterViewInit, Component, computed, inject, input, Signal } from '@angular/core';
import { PlayerEntity, PlayerGameEntity } from 'libs/index';
import { DialogModule } from 'primeng/dialog';
import { Column } from '../../shared/models/column.model';
import { getTagColumns } from '../../shared/helpers/data.helper';
import { TableComponent } from '../../shared/components/table/table.component';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { StatsTableComponent, StatsTableItem } from '../../shared/components/stats-table/stats-table.component';
import { TrophyListComponent } from '../../club/trophy-list/trophy-list.component';
import { format } from 'date-fns';
import { DetailService } from '../../shared/services/detail.service';

@Component({
  selector: 'app-player-detail',
  imports: [
    DialogModule,
    TableComponent,
    TrophyIconComponent,
    TemplateIdDirective,
    StatsTableComponent,
    TrophyListComponent,
  ],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.scss',
})
export class PlayerDetailComponent implements AfterViewInit {
  detailService = inject(DetailService);

  readonly player = input<PlayerEntity>();

  visible = false;

  stats: Signal<StatsTableItem[]> = computed(() => {
    const p = this.player();
    if (p) {
      return [
        {
          title: 'Wins',
          value: p.WinCount,
        },
        {
          title: 'Losses',
          value: p.LossCount,
        },
        {
          title: 'Non-Scoring',
          value: p.NonScoreCount,
        },
        {
          title: 'Total Points',
          value: p.totalPoints > 0 ? p.totalPoints : undefined,
        },
        {
          title: 'Best Game(s)',
          value: p.BestGameWins,
          content: p.BestGames,
        },
        {
          title: 'First Seen',
          content: [format(p.FirstSeen ?? 0, 'yyyy/M/d')],
        },
        {
          title: 'Last Seen',
          content: [format(p.LastSeen ?? 0, 'yyyy/M/d')],
        },
        { title: 'Tags', content: p.Tags.filter((t) => !t.Category) },
        ...getTagColumns<PlayerEntity>('DisplayOnPlayers').map((x) => ({
          title: x.name ?? x.id,
          content: (x.fieldFunc?.(p) as unknown[]) ?? [],
        })),
      ];
    } else {
      return [];
    }
  });

  columns: Column<PlayerGameEntity>[] = [
    { id: 'won', name: '', dataType: 'custom', class: 'shrink' },
    { id: 'Date', dataType: 'date', fieldFunc: (x) => x.Game!.Date },
    { id: 'Game', dataType: 'text', fieldFunc: (x) => x.Game!.BoardGame!.Name },
    { id: 'Points', dataType: 'score', boardGame: (row) => row.Game?.BoardGame },
    { id: 'Name', name: 'Team Name', dataType: 'text' },

    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnPlayerGames'),
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.visible = true;
    }, 50);
  }
}
