import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
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
import { MapPipe } from '../../pipes/map.pipe';

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
    MapPipe,
    CommonModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T extends object> implements OnChanges, AfterContentInit {
  @ContentChildren(TemplateIdDirective) templates!: QueryList<TemplateIdDirective>;

  @Input() columns: Column<T>[] = [];
  @Input() rows: T[] = [];
  @Input() sortBy?: keyof T & string;
  @Input() sortOrder = -1;
  @Input() canEdit = false;

  @Input() groupRowsBy: keyof T | null = null;
  @Input() spanRowsBy: keyof T | null = null;

  @Input() showExpansion: ((item: T) => boolean) | boolean = true;

  @Output() edit = new EventEmitter<T>();
  @Output() expand = new EventEmitter<T>();

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

  showSpan(table: Table, index: number) {
    if (this.spanRowsBy) {
      if (table.sortOrder === 1) {
        index = this.rows.length - index;
      } else {
        // Continue
      }
      return (
        table.sortField === this.sortBy &&
        this.rows.at(index - 1)?.[this.spanRowsBy] !== this.rows.at(index)?.[this.spanRowsBy]
      );
    } else {
      return false;
    }
  }

  canShowExpansion(row: T): boolean {
    if (typeof this.showExpansion === 'boolean') {
      return this.showExpansion;
    } else {
      return this.showExpansion(row);
    }
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
    if (row === undefined) {
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
