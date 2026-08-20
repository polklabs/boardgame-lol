import { AfterViewInit, Component, computed, inject, input, Signal } from '@angular/core';
import { DetailService } from '../../shared/services/detail.service';
import {
  BaseEntity,
  BoardGameEntity,
  GameEntity,
  PlayerEntity,
  PlayerGameEntity,
  TagEntity,
  TagPlayerGameEntity,
} from 'libs/index';
import { Column } from '../../shared/models/column.model';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { ApiService } from '../../shared/services/api.service';
import { TagComponent } from '../../shared/components/tag/tag.component';

type TagTypes = GameEntity | PlayerGameEntity | PlayerEntity | BoardGameEntity;

type TagRow = {
  Category: string;
  Name: string;
  Date: string;
  Data: TagTypes | null;
};

@Component({
  selector: 'app-tag-detail',
  imports: [DialogComponent, TableComponent, TagComponent],
  templateUrl: './tag-detail.component.html',
  styleUrl: './tag-detail.component.scss',
})
export class TagDetailComponent implements AfterViewInit {
  detailService = inject(DetailService);
  api = inject(ApiService);

  readonly tag = input<TagEntity>();

  visible = false;

  rows: Signal<TagRow[]> = computed(() => {
    const rows: TagRow[] = [];

    this.createRows(
      'BoardGames',
      rows,
      this.api.tagBoardGames.list.filter((x) => !x.Filter),
      (t) => this.api.boardGames.getOne(t.BoardGameId),
      (d) => d?.Name ?? '',
    );

    this.createRows(
      'Players',
      rows,
      this.api.tagPlayers.list,
      (t) => this.api.players.getOne(t.PlayerId),
      (d) => d?.FullName ?? '',
    );

    this.createRows(
      'Games',
      rows,
      this.api.tagGames.list,
      (t) => this.api.games.getOne(t.GameId),
      (d) => d?.BoardGame?.Name ?? '',
      (d) => d?.Date ?? '',
    );

    this.createRows<TagPlayerGameEntity, PlayerGameEntity>(
      'Game Scores',
      rows,
      this.api.tagPlayerGames.list,
      (t) => this.api.playerGames.getOne(t.PlayerGameId),
      (d) => `${d?.Game?.BoardGame?.Name ?? ''} - ${d?.DisplayNameShort ?? ''}`,
      (d) => d?.Game?.Date ?? '',
      (d) => d?.Game ?? null,
    );

    return rows;
  });

  columns: Column<TagRow>[] = [
    { id: 'Name', name: 'Name', dataType: 'text', rowSpan: true },
    { id: 'Date', dataType: 'date' },
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.visible = true;
    }, 50);
  }

  rowClicked(row: TagRow) {
    if (row.Data) {
      this.detailService.showDetail(row.Data);
    } else {
      // Continue
    }
  }

  isRowSpan(row: TagRow) {
    return row.Name === '';
  }

  createRows<T extends BaseEntity & { Tag: TagEntity | null }, K extends TagTypes>(
    Category: string,
    rows: TagRow[],
    wrapper: T[],
    getOne: (t: T) => K | null,
    getName: (x: K) => string,
    getDate: (x: K) => string = () => '',
    getData: (x: K) => TagTypes | null = (x) => x,
  ) {
    wrapper
      .filter((x) => x.Tag === this.tag())
      .map((t) => getOne(t))
      .filter((x) => x !== null)
      .forEach((Data, i) => {
        if (i === 0) {
          rows.push({ Category, Name: '', Date: '', Data: null });
        } else {
          // Continue
        }
        rows.push({ Category, Name: getName(Data), Date: getDate(Data), Data: getData(Data) });
      });
  }
}
