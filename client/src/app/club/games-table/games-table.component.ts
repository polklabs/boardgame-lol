import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameEntity, PlayerGameEntity } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { getTagColumns } from '../../shared/helpers/data.helper';
import { SortPipe } from '../../shared/pipes/sort.pipe';

@Component({
  selector: 'app-games-table',
  imports: [
    TableModule,
    TagModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    IconFieldModule,
    InputIconModule,
    TrophyIconComponent,
    TableComponent,
    TemplateIdDirective,
    SortPipe,
  ],
  templateUrl: './games-table.component.html',
  styleUrl: './games-table.component.scss',
})
export class GamesTableComponent {
  @Input() games$?: Observable<GameEntity[]>;
  @Input() canEdit = false;

  @Output() gameEdit = new EventEmitter<GameEntity>();
  @Output() moveUp = new EventEmitter<GameEntity>();
  @Output() moveDown = new EventEmitter<GameEntity>();

  columns: Column<GameEntity>[] = [
    { id: 'EventsName', name: 'Event', dataType: 'text' },
    { id: 'dateSortOrder', name: 'Date', dataType: 'date' },
    { id: 'BoardGameName', name: 'Game', dataType: 'text' },
    { id: 'HighScore', name: 'Points', dataType: 'score', boardGame: (x) => x.BoardGame },
    { id: 'WinnerTeams', name: 'Winner(s)', dataType: 'array', keys: 'DisplayName' },
    { id: 'Notes', class: 'notes-column', dataType: 'text' },
    { id: 'PlayerCount', name: 'Players', dataType: 'number' },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnGames'),
  ];

  expansionColumns: Column<PlayerGameEntity>[] = [
    { id: 'DisplayName', name: 'Name', dataType: 'text' },
    { id: 'Points', dataType: 'score', boardGame: (row) => row.Game?.BoardGame },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    ...getTagColumns('DisplayOnPlayerGames'),
  ];

  canAdjustOrder(table: Table, games: GameEntity[], index: number): boolean {
    return games.at(index - 1)?.Date === games[index].Date || games.at(index + 1)?.Date === games[index].Date;
  }

  canAdjustDown(games: GameEntity[], index: number): boolean {
    return games.at(index + 1)?.Date === games[index].Date;
  }

  canAdjustUp(games: GameEntity[], index: number): boolean {
    return games.at(index - 1)?.Date === games[index].Date;
  }
}
