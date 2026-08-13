import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameEntity } from 'libs/index';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
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
    TableComponent,
    TemplateIdDirective,
  ],
  templateUrl: './games-table.component.html',
  styleUrl: './games-table.component.scss',
})
export class GamesTableComponent implements OnInit {
  @Input() games$?: Observable<GameEntity[]>;
  @Input() canEdit = false;

  @Output() gameEdit = new EventEmitter<GameEntity>();
  @Output() moveUp = new EventEmitter<GameEntity>();
  @Output() moveDown = new EventEmitter<GameEntity>();

  games: GameEntity[] = [];

  isRowSpan = (r?: GameEntity) => (r ? r.GameId === '' : false);

  columns: Column<GameEntity>[] = [
    { id: 'EventsName', name: 'Event', dataType: 'text', shrink: true },
    { id: 'dateSortOrder', name: 'Date', dataType: 'date', rowSpan: true },
    { id: 'BoardGameName', name: 'Game', dataType: 'text' },
    { id: 'HighScore', name: 'Points', dataType: 'score', boardGame: (x) => x.BoardGame },
    { id: 'WinnerTeams', name: 'Winner(s)', dataType: 'array', keys: 'DisplayNameShort', hasLinks: true },
    { id: 'Notes', class: 'notes-column', dataType: 'text' },
    { id: 'PlayerCount', name: 'Players', dataType: 'number' },
    { id: 'Tags', dataType: 'tag' },
  ];

  ngOnInit(): void {
    this.games$?.subscribe((g) => {
      this.games = g.toSorted((a, b) => b.dateSortOrder.localeCompare(a.dateSortOrder));

      let year = '';
      let i = 0;
      while (i < this.games.length) {
        const row = this.games[i] as GameEntity;
        if (year !== row.year) {
          year = row.year;
          const fakeRow = new GameEntity({ Date: row.Date });
          this.games.splice(i, 0, fakeRow);
          i++;
        } else {
          // Skip
        }

        i++;
      }
    });
  }

  canAdjustOrder(games: GameEntity[], index: number): boolean {
    return this.canAdjustDown(games, index) || this.canAdjustUp(games, index);
  }

  canAdjustDown(games: GameEntity[], index: number): boolean {
    return games.at(index + 1)?.Date === games[index].Date && !this.isRowSpan(games.at(index + 1));
  }

  canAdjustUp(games: GameEntity[], index: number): boolean {
    return games.at(index - 1)?.Date === games[index].Date && !this.isRowSpan(games.at(index - 1));
  }
}
