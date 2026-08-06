import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BoardGameEntity } from 'libs/index';
import { TrophyService } from '../../shared/services/trophy.service';
import { HidePipe } from '../../shared/pipes/hide.pipe';
import { TagModule } from 'primeng/tag';
import { Column } from '../../shared/models/column.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { TemplateIdDirective } from '../../shared/directives/template-id.directive';
import { DetailLinkComponent } from "../../shared/components/detail-link/detail-link.component";

@Component({
  selector: 'app-board-game-table',
  imports: [TableModule, ButtonModule, TagModule, CommonModule, HidePipe, TableComponent, TemplateIdDirective, DetailLinkComponent],
  templateUrl: './board-game-table.component.html',
  styleUrl: './board-game-table.component.scss',
})
export class BoardGameTableComponent {
  trophyService = inject(TrophyService);

  @Input() boardGames: BoardGameEntity[] = [];
  @Input() canEdit = false;

  @Output() boardGameEdit = new EventEmitter<BoardGameEntity>();

  columns: Column<BoardGameEntity>[] = [
    { id: 'Name', name: 'Game', dataType: 'text', sort: true },
    { id: 'PlayCount', name: 'Plays', dataType: 'custom', sort: true },
    { id: 'ChampionWins', name: 'Champion(s)', dataType: 'custom', sort: true },
    { id: 'MinPlayers', name: 'Players', dataType: 'custom', sort: true },
    { id: 'MaxScore', name: 'High Score', dataType: 'score', boardGame: (row) => row, sort: true },
    { id: 'Tags', dataType: 'tag' },
  ];

  mostPlays = this.trophyService.getTrophy('MostPlays');

  showExpansion(boardGame: BoardGameEntity) {
    return boardGame.WinCounts.length > 0;
  }
}
