import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameEntity, PlayerGameEntity, TagCategoryMapping } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TrophyIconComponent } from '../../shared/components/trophy-icon/trophy-icon.component';
import { format, isSameYear } from 'date-fns';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';

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
    { id: 'dateSortOrder', name: 'Date', sort: true, dataType: 'date' },
    { id: 'BoardGame', name: 'Game', sort: true, dataType: 'text', fieldFunc: (x) => x.BoardGame!.Name },
    { id: 'Notes', sort: true, class: 'notes-column', dataType: 'text' },
    { id: 'WinnerTeams', name: 'Winner(s)', dataType: 'array', keys: 'DisplayName' },
    { id: 'HighScore', name: 'Points', sort: true, dataType: 'score', boardGame: (x) => x.BoardGame },
    { id: 'Players', sort: true, dataType: 'number' },
    { id: 'Tags', dataType: 'tag' },
  ];

  expansionColumns: Column<PlayerGameEntity>[] = [
    { id: 'DisplayName', name: 'Name', dataType: 'text' },
    { id: 'Tags', dataType: 'tag', fieldFunc: (x) => x.Tags.filter((t) => !t.Category) },
    {
      id: 'Tags',
      name: TagCategoryMapping['character'].text,
      dataType: 'tag',
      fieldFunc: (x) => x.Tags.filter((t) => t.Category === 'character'),
    },
    {
      id: 'Tags',
      name: TagCategoryMapping['faction'].text,
      dataType: 'tag',
      fieldFunc: (x) => x.Tags.filter((t) => t.Category === 'faction'),
    },
    {
      id: 'Tags',
      name: TagCategoryMapping['role'].text,
      dataType: 'tag',
      fieldFunc: (x) => x.Tags.filter((t) => t.Category === 'role'),
    },
    {
      id: 'Tags',
      name: TagCategoryMapping['victory-method'].text,
      dataType: 'tag',
      fieldFunc: (x) => x.Tags.filter((t) => t.Category === 'victory-method'),
    },
    {
      id: 'Tags',
      name: TagCategoryMapping['death-cause'].text,
      dataType: 'tag',
      fieldFunc: (x) => x.Tags.filter((t) => t.Category === 'death-cause'),
    },
    { id: 'Points', dataType: 'score', boardGame: (row) => row.Game?.BoardGame },
  ];

  showYearRow(table: Table, games: GameEntity[], index: number) {
    if (table.sortOrder === 1) {
      index = games.length - index;
    } else {
      // Continue
    }
    return (
      table.sortField === 'dateSortOrder' &&
      !isSameYear(games.at(index - 1)?.DateObj ?? 0, games.at(index)?.DateObj ?? 0)
    );
  }

  getYearText(game: GameEntity) {
    return format(game.DateObj, 'yyyy');
  }

  canAdjustOrder(table: Table, games: GameEntity[], index: number): boolean {
    if (table.sortField === 'dateSortOrder' && table.sortOrder === -1) {
      return games.at(index - 1)?.Date === games[index].Date || games.at(index + 1)?.Date === games[index].Date;
    } else {
      return false;
    }
  }

  canAdjustDown(games: GameEntity[], index: number): boolean {
    return games.at(index + 1)?.Date === games[index].Date;
  }

  canAdjustUp(games: GameEntity[], index: number): boolean {
    return games.at(index - 1)?.Date === games[index].Date;
  }
}
