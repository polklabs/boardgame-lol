import { getIgnore } from 'libs/decorators/ignore.decorator';
import { BaseEntity, getForeignKeys, getPrimaryKeys } from 'libs/index';
import { BehaviorSubject, Observable } from 'rxjs';

export class EntityWrapper<T extends BaseEntity> {
  // Entity Storage -----------------------------------
  // Unfiltered
  private _raw$ = new BehaviorSubject<T[]>([]);
  // Filtered
  private _list$ = new BehaviorSubject<T[]>([]);
  private _dict = new Map<string, T>();
  private _foreignDict = new Map<string, T[]>();

  // Helper Functions ---------------------------------
  private keyFunc: (obj: T) => string;
  private entityType: new (partial: Partial<T>) => T;
  private primaryKeys: (keyof T)[];
  private foreignKeys: (keyof T)[] = [];
  private autoClear = true;
  private recreateForeignKeyDict = true;

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
    this.foreignKeys = getForeignKeys(entityType) as (keyof T)[];
    this.keyFunc = (obj) => this.primaryKeys.map((k) => obj[k]).join(';');
  }

  setAutoClear(value: boolean) {
    this.autoClear = value;
    return this;
  }

  getOne(...ids: string[]): T | null {
    const key = ids.join(';');
    return this._dict.get(key) ?? null;
  }

  getByForeignKey(id: string): T[] {
    this.updateForeignKeyDict();
    return this._foreignDict.get(id) ?? [];
  }

  resetCalculated() {
    const newObj = new this.entityType({});
    const ignored = getIgnore(this.entityType);
    this.raw.forEach((x) => x.resetCalculated(newObj, ignored));
  }

  calculate() {
    this.raw.forEach((x) => x.calculate());
  }

  clear() {
    if (this.autoClear) {
      this._foreignDict.clear();
      this._dict.clear();
      this._raw$.next([]);
      this._list$.next([]);
    } else {
      //Skip
    }
  }

  deleteOne(...ids: string[]) {
    const key = ids.join(';');
    const list = this.raw.filter((x) => this.keyFunc(x) !== key);
    this._dict.delete(key);
    this._raw$.next(list);
    this._list$.next(list);
    this.recreateForeignKeyDict = true;
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
    const list = baseList;
    const dict = this._dict;

    if (clear) {
      baseList.splice(0, baseList.length);
      dict.clear();

      list.push(...items);
      items.forEach((item) => {
        dict.set(this.keyFunc(item) ?? '', item);
      });
    } else {
      for (const item of items) {
        dict.set(this.keyFunc(item) ?? '', item);
        const pgIndex = list.findIndex((x) => this.keyFunc(x) === this.keyFunc(item));
        if (pgIndex >= 0) {
          list[pgIndex] = item;
        } else {
          list.push(item);
        }
      }

      const keys = new Set(list.map(this.keyFunc));
      Array.from(dict.keys()).forEach((k) => {
        if (keys.has(k)) {
          // Continue
        } else {
          dict.delete(k);
        }
      });
    }

    this._dict = dict;
    this._raw$.next(list);
    this._list$.next(list);
    this.recreateForeignKeyDict = true;
  }

  updateForeignKeyDict() {
    if (this.recreateForeignKeyDict) {
      this._foreignDict.clear();
      this.list.forEach((item) => {
        this.foreignKeys.forEach((key) => {
          if (this._foreignDict.has(item[key] as string)) {
            // Continue
          } else {
            this._foreignDict.set(item[key] as string, []);
          }
          this._foreignDict.get(item[key] as string)?.push(item);
        });
      });
      this.recreateForeignKeyDict = false;
    } else {
      // Continue
    }
  }

  filter(predicate: (item: T) => boolean) {
    this._list$.next(this.raw.filter(predicate));
    this.recreateForeignKeyDict = true;
  }

  sort(compareFn?: ((a: T, b: T) => number) | undefined) {
    this.raw.sort(compareFn);
    this.list.sort(compareFn);
  }

  clearFilter() {
    this._list$.next([...this.raw]);
    this.recreateForeignKeyDict = true;
  }
}
