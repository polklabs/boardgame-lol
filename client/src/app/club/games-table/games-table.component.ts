import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameEntity } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { SortPipe } from '../../shared/pipes/sort.pipe';
import { PlayDetailComponent } from '../../details/play-detail/play-detail.component';

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
    TableComponent,
    TemplateIdDirective,
    SortPipe,
    PlayDetailComponent,
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

  playDetails?: GameEntity;
  playDetailsShow = false;

  columns: Column<GameEntity>[] = [
    { id: 'EventsName', name: 'Event', dataType: 'text' },
    { id: 'dateSortOrder', name: 'Date', dataType: 'date', rowSpan: true },
    { id: 'BoardGameName', name: 'Game', dataType: 'text' },
    { id: 'HighScore', name: 'Points', dataType: 'score', boardGame: (x) => x.BoardGame },
    { id: 'WinnerTeams', name: 'Winner(s)', dataType: 'array', keys: 'DisplayName' },
    { id: 'Notes', class: 'notes-column', dataType: 'text' },
    { id: 'PlayerCount', name: 'Players', dataType: 'number' },
    { id: 'Tags', dataType: 'tag' },
  ];

  openPlayDetail(play: GameEntity) {
    this.playDetails = play;
    this.playDetailsShow = true;
  }

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
