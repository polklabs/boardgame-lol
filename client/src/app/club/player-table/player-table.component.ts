import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { PlayerEntity } from 'libs/index';
import { TrophyService } from '../../shared/services/trophy.service';
import { ITrophy } from '../../shared/trophies/trophy.model';
import { HidePipe } from '../../shared/pipes/hide.pipe';
import { TagModule } from 'primeng/tag';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { MapPipe } from '../../shared/pipes/map.pipe';

@Component({
  selector: 'app-player-table',
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    CommonModule,
    HidePipe,
    TableComponent,
    TemplateIdDirective,
    MapPipe,
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
    { id: 'NonScoreCount', name: 'Non-Scoring', sort: true, dataType: 'number' },
    { id: 'BestGameWins', name: 'Best Game(s)', sort: true, dataType: 'custom' },
    { id: 'FirstSeen', name: 'First Seen', sort: true, dataType: 'date' },
    { id: 'Tags', dataType: 'tag' },
  ];
}
