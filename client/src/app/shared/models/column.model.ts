import { BoardGameEntity, TagEntity } from 'libs/index';

// Base shared fields
interface IColumnBase<T, K = unknown> {
  id: string;
  fieldFunc?: (_: T) => K;
  name?: string;
  dataType: 'custom' | 'text' | 'date' | 'number' | 'decimal' | 'score' | 'tag' | 'array';

  // Optional
  sort?: boolean;
  class?: string;
}

interface ITextColumn<T> extends IColumnBase<T> {
  dataType: 'text';
  suffix?: string;
}

interface INumberColumn<T> extends IColumnBase<T> {
  dataType: 'number';
  suffix?: string;
}

interface ITagColumn<T> extends IColumnBase<T, TagEntity[]> {
  dataType: 'tag';
}

interface IArrayColumn<T> extends IColumnBase<T, unknown[]> {
  dataType: 'array';
  keys: string | string[];
}

interface IDateColumn<T> extends IColumnBase<T, string | number | Date> {
  dataType: 'date';
}

interface IDecimalColumn<T> extends IColumnBase<T, number> {
  dataType: 'decimal';
  decimalPlaces?: number;
}

interface IScoreColumn<T> extends IColumnBase<T, number> {
  dataType: 'score';
  decimalPlaces?: number;
  boardGame: (_: T) => BoardGameEntity | null | undefined;
}

interface ICustomColumn<T> extends IColumnBase<T> {
  dataType: 'custom';
}

// Union type — this is your single Column type
export type Column<T> =
  | ICustomColumn<T>
  | ITextColumn<T>
  | INumberColumn<T>
  | IScoreColumn<T>
  | ITagColumn<T>
  | IDateColumn<T>
  | IDecimalColumn<T>
  | IArrayColumn<T>;
