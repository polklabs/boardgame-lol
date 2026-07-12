import 'reflect-metadata'; // This must be imported here for the prod build to work
import { getIgnore, Ignore } from '../decorators/ignore.decorator';

export abstract class BaseEntity {
  // These fields are all required but will be assigned by the Base.Manager
  // User should never have control over these values

  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: string = 'ANON';
  LastModifiedDate?: string = new Date().toISOString();
  LastModifiedBy?: string = 'ANON';

  @Ignore()
  calculated = false;

  abstract calculate(): void;

  constructor(partial: Partial<BaseEntity>, entityType: new (partial: Partial<BaseEntity>) => BaseEntity) {
    this.assign(partial, entityType, false);
  }

  protected assign<T>(partial: Partial<T>, entityType: new (partial: Partial<T>) => T, copyIgnored: boolean) {
    const ignored = getIgnore(entityType);
    for (const key in partial) {
      if (partial.hasOwnProperty(key) && key in this) {
        const temp = this as { [k in typeof key]: any };

        if (temp[key] === null) {
          this.nullConverter(partial, key);
        } else {
          // continue
        }

        if (temp[key] === true || temp[key] === false) {
          this.booleanConverter(partial, key);
        } else {
          // continue
        }

        if (typeof partial[key] === 'string') {
          partial[key] = (partial[key] as string).replaceAll('&amp;', '&') as T[Extract<keyof T, string>];
        } else {
          // continue
        }

        if (copyIgnored === false && ignored.includes(key)) {
          continue;
        }

        try {
          // It's a regular property, set the value
          temp[key] = partial[key];
        } catch (e) {
          // continue
        }
      }
    }
  }

  resetCalculated<T extends BaseEntity>(entity: T, entityType: new (partial: Partial<T>) => T) {
    const ignored = getIgnore(entityType);
    for (const key in ignored) {
      if (key in entity && key in this) {
        const temp = this as { [k in typeof key]: any };
        const newInstance = this as { [k in typeof key]: any };
        temp[key] = newInstance[key];
      }
    }
  }

  calculationsComplete<T extends BaseEntity>(item?: T | (T | null)[] | null) {
    let complete: boolean;
    if (Array.isArray(item)) {
      complete = item.every((x) => x?.calculated ?? false);
    } else {
      complete = item?.calculated ?? false;
    }

    console.assert(complete, 'Calculations incomplete:', item);
  }

  protected booleanConverter<T>(partial: Partial<T>, propName: keyof T) {
    if (partial[propName] !== undefined && partial[propName] !== null && typeof partial[propName] === 'number') {
      partial[propName] = (partial[propName] === 1) as T[keyof T];
    } else {
      // continue
    }
  }

  protected nullConverter<T>(partial: Partial<T>, propName: keyof T) {
    if (partial[propName] === undefined || partial[propName] === '') {
      partial[propName] = null as T[keyof T];
    } else {
      // continue
    }
  }
}
