import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
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
import { ArrayPipe } from '../../pipes/array.pipe';

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
    ArrayPipe,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T extends object> implements OnChanges, AfterContentInit {
  @ContentChildren(TemplateIdDirective) templates!: QueryList<TemplateIdDirective>;

  @Input() columns: Column<T>[] = [];
  @Input() rows: T[] = [];
  @Input() sort?: { field: keyof T & string; order: -1 | 1 };
  @Input() baseTable = false;
  @Input() canEdit = false;
  @Input() dataKey?: string;

  @Input() showExpansion: (item: T) => boolean = () => true;

  @Output() edit = new EventEmitter<T>();

  cols: Column<T>[] = [];

  templateMap = new Map<string, TemplateRef<{ $implicit: T; table?: Table; rowIndex?: number }>>();

  expandedRows = {};

  ngAfterContentInit() {
    this.templates.forEach((t) => {
      this.templateMap.set(t.id, t.template);
    });
  }

  ngOnChanges(): void {
    this.filterColumns();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property(row: T, column: Column<T>): any {
    if (column.dataType === 'custom') {
      return true;
    } else if (column.fieldFunc) {
      return column.fieldFunc(row);
    } else if (column.id in row) {
      return row[column.id as keyof T];
    } else {
      console.error(`id (${column.id}) must exist on object T or fieldFunc must return a value`);
    }
  }
}
