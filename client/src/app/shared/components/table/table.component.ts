import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { Column } from '../../models/column.model';
import { Table, TableModule } from 'primeng/table';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { TagComponent } from '../tag/tag.component';
import { HidePipe } from '../../pipes/hide.pipe';
import { TemplateIdDirective } from '../../directives/template-id.directive';
import { isEmptyLike } from '../../helpers/data.helper';
import { ScorePipe } from '../../pipes/score.pipe';
import { ButtonModule } from 'primeng/button';
import { DetailService } from '../../services/detail.service';
import { DetailLinkComponent } from '../detail-link/detail-link.component';

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    DatePipe,
    DecimalPipe,
    TagComponent,
    HidePipe,
    CommonModule,
    ScorePipe,
    ButtonModule,
    CommonModule,
    DetailLinkComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T extends object> implements OnChanges, AfterContentInit {
  detailService = inject(DetailService);

  @ContentChildren(TemplateIdDirective) templates!: QueryList<TemplateIdDirective>;

  @Input() columns: Column<T>[] = [];
  @Input() rows: T[] = [];
  @Input() sortBy?: keyof T & string;
  @Input() sortOrder = -1;
  @Input() canEdit = false;

  @Input() groupRowsBy: keyof T | null = null;
  @Input() isRowSpan: (item: T) => boolean = () => false;
  @Input() rowSpanBy: keyof T | null = null;

  @Input() virtualScroll = false;

  readonly tiny = input(false);

  @Input() showExpansion: ((item: T) => boolean) | boolean = true;
  @Input() canOpenDetail: boolean = false;
  @Input() canClick: boolean = false;

  @Output() edit = new EventEmitter<T>();
  @Output() rowClicked = new EventEmitter<T>();

  cols: Column<T>[] = [];

  templateMap = new Map<string, TemplateRef<{ $implicit: T; table?: Table; rowIndex?: number }>>();

  expandedRows = {};

  ngAfterContentInit() {
    this.templates.forEach((t) => {
      this.templateMap.set(t.id, t.template);
    });
  }

  ngOnChanges(changed: SimpleChanges): void {
    if ('columns' in changed || 'rows' in changed) {
      this.filterColumns();
    } else {
      // Keep same column filter
    }
  }

  filterColumns() {
    if (this.rows.length === 0) {
      this.cols = [];
    } else {
      // Continue
    }

    this.cols = this.columns.filter((col) => {
      if (col.dataType === 'score') {
        if (this.rows.every((r) => col.boardGame(r)?.ScoreType !== 'points')) {
          return false;
        } else {
          // Continue
        }
      } else {
        // Continue
      }

      return this.rows.some((row) => {
        return this.hasData(row, col);
      });
    });
  }

  hasData(row: T, column: Column<T>) {
    return !isEmptyLike(this.property(row, column));
  }

  rowClick(row: T): void {
    if (this.canShowExpansion(row)) {
      this.detailService.showDetail(row);
    } else if (this.canOpenDetail) {
      this.detailService.showDetail(row);
    } else if (this.canClick) {
      this.rowClicked.emit(row);
    } else {
      // Continue
    }
  }

  rowSpanColumn() {
    const col = this.cols.findIndex((x) => x.rowSpan);
    if (col === -1) {
      return 1;
    } else {
      return col;
    }
  }

  canShowExpansion(row: T): boolean {
    if (typeof this.showExpansion === 'boolean') {
      return this.showExpansion;
    } else {
      return this.showExpansion(row);
    }
  }

  showClickable(row: T) {
    return this.canShowExpansion(row) || this.canOpenDetail || this.canClick;
  }

  rowGroup(row: T, index: number, col: Column<T>): number {
    if (col.id === this.groupRowsBy) {
      const data = this.property(row, col);

      if (isEmptyLike(data)) {
        return 1;
      } else {
        // Continue
      }

      if (index > 0 && data === this.property(this.rows.at(index - 1), col)) {
        return 0;
      } else {
        // Continue
      }

      let span = data;
      let i = 0;
      while (span === data && i < this.rows.length) {
        i++;
        span = this.property(this.rows.at(index + i), col);
      }
      return i;
    } else {
      return 1;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property(row: T | undefined, column: Column<T>): any {
    if (row === undefined || this.isRowSpan(row)) {
      return undefined;
    } else if (column.dataType === 'custom') {
      return 'Custom Column';
    } else if (column.fieldFunc) {
      return column.fieldFunc(row);
    } else if (column.id in row) {
      return row[column.id as keyof T];
    } else {
      console.error(`id (${column.id}) must exist on object T or fieldFunc must return a value`);
    }
  }
}
