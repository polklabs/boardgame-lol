import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { PlayerEntity, PlayerGameEntity, TagCategoryMapping } from 'libs/index';
import { TrophyService } from '../../shared/services/trophy.service';
import { ITrophy } from '../../shared/trophies/trophy.model';
import { HidePipe } from '../../shared/pipes/hide.pipe';
import { ArrayPipe } from '../../shared/pipes/array.pipe';
import { TagModule } from 'primeng/tag';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { getTagColumns, tagFilter } from '../../shared/helpers/data.helper';

@Component({
  selector: 'app-player-table',
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
    HidePipe,
    ArrayPipe,
    TrophyIconComponent,
    TableComponent,
    TemplateIdDirective,
  ],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss',
})
export class PlayerTableComponent {
  private trophyService = inject(TrophyService);

  @Input() players$?: Observable<PlayerEntity[]>;
  @Input() canEdit = false;

  @Output() playerEdit = new EventEmitter<PlayerEntity>();

  mostWins: ITrophy = this.trophyService.getTrophy('MostWins');

  columns: Column<PlayerEntity>[] = [
    { id: 'Name', sort: true, dataType: 'custom' },
    { id: 'WinCount', name: 'Wins', sort: true, dataType: 'custom' },
    { id: 'LossCount', name: 'Losses', sort: true, dataType: 'number' },
    { id: 'BestGameWins', name: 'Best Game(s)', sort: true, dataType: 'custom' },
    { id: 'FirstSeen', name: 'First Seen', sort: true, dataType: 'date' },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnPlayers'),
  ];

  expansionColumns: Column<PlayerGameEntity>[] = [
    { id: 'won', name: '', dataType: 'custom' },
    { id: 'Date', dataType: 'date', fieldFunc: (x) => x.Game!.Date },
    { id: 'Game', dataType: 'text', fieldFunc: (x) => x.Game!.BoardGame!.Name },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnPlayerGames'),
    { id: 'Points', dataType: 'score', boardGame: (row) => row.Game?.BoardGame },
  ];
}
