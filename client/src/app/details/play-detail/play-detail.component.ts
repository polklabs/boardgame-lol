import { Component, computed, input, output, Signal } from '@angular/core';
import { GameEntity, PlayerGameEntity } from 'libs/index';
import { DialogModule } from 'primeng/dialog';
import { StatsTableItem, StatsTableComponent } from '../../shared/components/stats-table/stats-table.component';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { getTagColumns } from '../../shared/helpers/data.helper';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-play-detail',
  imports: [DialogModule, StatsTableComponent, TableComponent, TrophyIconComponent, TemplateIdDirective, DatePipe],
  templateUrl: './play-detail.component.html',
  styleUrl: './play-detail.component.scss',
})
export class PlayDetailComponent {
  readonly game = input<GameEntity>();
  readonly visible = input.required<boolean>();
  readonly closeDetails = output<void>();

  stats: Signal<StatsTableItem[]> = computed(() => {
    const g = this.game();
    if (g) {
      return [
        { title: 'Event', content: g.Events.length > 0 ? g.Events : undefined },
        { title: 'Notes', content: g.Notes ? [g.Notes] : undefined },
        { title: 'Player Count', value: g.PlayerCount },
        { title: 'Tags', content: g.Tags.filter((t) => !t.Category) },
        ...getTagColumns<GameEntity>('DisplayOnGames').map((x) => ({
          title: x.name ?? x.id,
          content: (x.fieldFunc?.(g) as unknown[]) ?? [],
        })),
      ];
    } else {
      return [];
    }
  });

  columns: Column<PlayerGameEntity>[] = [
    { id: 'DisplayName', name: 'Name', dataType: 'text' },
    { id: 'Points', dataType: 'score', boardGame: (row) => row.Game?.BoardGame },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnPlayerGames'),
  ];
}
