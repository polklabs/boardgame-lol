import { BaseEntity, getPrimaryKeys } from 'libs/index';
import { BehaviorSubject, Observable } from 'rxjs';

export class EntityWrapper<T extends BaseEntity> {
  // Entity Storage -----------------------------------
  // Unfiltered
  private _raw$ = new BehaviorSubject<T[]>([]);
  // Filtered
  private _list$ = new BehaviorSubject<T[]>([]);
  private _dict: Record<string, T> = {};

  // Helper Functions ---------------------------------
  private keyFunc: (obj: T) => string;
  private entityType: new (partial: Partial<T>) => T;
  private primaryKeys: (keyof T)[];

  // Getters ------------------------------------------
  get raw$(): Observable<T[]> {
    return this._raw$.asObservable();
  }

  get raw(): T[] {
    return this._raw$.value;
  }

  get list$(): Observable<T[]> {
    return this._list$.asObservable();
  }

  get list(): T[] {
    return this._list$.value;
  }

  get primaryIdSet(): Set<string> {
    return new Set<string>(this.raw.map(this.keyFunc));
  }

  constructor(entityType: new (partial: Partial<T>) => T) {
    this.entityType = entityType;
    this.primaryKeys = getPrimaryKeys(entityType) as (keyof T)[];
    this.keyFunc = (obj) => this.primaryKeys.map((k) => obj[k]).join(';');
  }

  getOne(...ids: string[]): T | null {
    const key = ids.join(';');
    if (key && key in this._dict) {
      return this._dict[key];
    } else {
      return null;
    }
  }

  resetCalculated() {
    this.raw.forEach((x) => x.resetCalculated(this.entityType));
  }

  calculate() {
    this.raw.forEach((x) => x.calculate());
  }

  clear() {
    this._dict = {};
    this._raw$.next([]);
    this._list$.next([]);
  }

  deleteOne(...ids: string[]) {
    const key = ids.join(';');
    const list = this.raw.filter((x) => this.keyFunc(x) !== key);
    this._raw$.next(list);
    this._list$.next(list);
  }

  deleteMany(toDelete: (item: T) => boolean) {
    this.upsert([], toDelete);
  }

  overwriteAll(items: T | T[]) {
    this.upsert(items, () => true, true);
  }

  upsert(items: T | T[], toDelete?: (item: T) => boolean, clear = false): void {
    items = (Array.isArray(items) ? items : [items]).map((x) => new this.entityType(x));
    const baseList = toDelete ? this.raw.filter((x) => !toDelete(x)) : this.raw;
    const list = clear ? [] : baseList;
    const dict = clear ? {} : this._dict;

    for (const item of items) {
      dict[this.keyFunc(item) ?? ''] = item;
      const pgIndex = list.findIndex((x) => this.keyFunc(x) === this.keyFunc(item));
      if (pgIndex >= 0) {
        list[pgIndex] = item;
      } else {
        list.push(item);
      }
    }

    if (clear) {
      // Skip
    } else {
      const keys = new Set(list.map(this.keyFunc));
      Object.keys(dict).forEach((k) => {
        if (keys.has(k)) {
          // Continue
        } else {
          delete dict[k];
        }
      });
    }

    this._dict = dict;
    this._raw$.next(list);
    this._list$.next(list);
  }

  filter(predicate: (item: T) => boolean) {
    this._list$.next(this.raw.filter(predicate));
  }

  sort(compareFn?: ((a: T, b: T) => number) | undefined) {
    this.raw.sort(compareFn);
    this.list.sort(compareFn);
  }

  clearFilter() {
    this._list$.next([...this.raw]);
  }
}
