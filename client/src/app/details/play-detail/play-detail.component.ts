import { AfterViewInit, Component, computed, inject, input, Signal } from '@angular/core';
import { GameEntity, PlayerGameEntity } from 'libs/index';
import { StatsTableItem, StatsTableComponent } from '../../shared/components/stats-table/stats-table.component';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { getTagColumns } from '../../shared/helpers/data.helper';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { DatePipe } from '@angular/common';
import { DetailService } from '../../shared/services/detail.service';
import { DetailLinkComponent } from "../../shared/components/detail-link/detail-link.component";
import { DialogComponent } from "../../shared/components/dialog/dialog.component";
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-play-detail',
  imports: [StatsTableComponent, TableComponent, TrophyIconComponent, TemplateIdDirective, DatePipe, DetailLinkComponent, DialogComponent, ButtonModule],
  templateUrl: './play-detail.component.html',
  styleUrl: './play-detail.component.scss',
})
export class PlayDetailComponent implements AfterViewInit {
  detailService = inject(DetailService);

  readonly game = input<GameEntity>();

  visible = false;

  stats: Signal<StatsTableItem[]> = computed(() => {
    const g = this.game();
    if (g) {
      return [
        { title: 'Event', content: g.Events.length > 0 ? g.Events : undefined },
        { title: 'Notes', content: g.Notes ? [g.Notes] : undefined },
        { title: 'Player Count', value: g.PlayerCount },
        { title: 'Tags', content: g.Tags.filter((t) => !t.Category) },
        ...getTagColumns<GameEntity>('OnGames').map((x) => ({
          title: x.name ?? x.id,
          content: (x.fieldFunc?.(g) as unknown[]) ?? [],
        })),
      ];
    } else {
      return [];
    }
  });

  columns: Column<PlayerGameEntity>[] = [
    { id: 'DisplayNameFull', name: 'Name', dataType: 'custom' },
    { id: 'Points', dataType: 'score', boardGame: (row) => row.Game?.BoardGame },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('OnPlayerGames'),
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.visible = true;
    }, 50);
  }
}
