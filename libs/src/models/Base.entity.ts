import { Exclude } from 'class-transformer';
import 'reflect-metadata'; // This must be imported here for the prod build to work
import { getIgnore } from '../decorators/ignore.decorator';

export abstract class BaseEntity {
  // These fields are all required but will be assigned by the Base.Manager
  // User should never have control over these values

  CreatedDate?: string = new Date().toISOString();
  CreatedBy?: string = 'ANON';
  LastModifiedDate?: string = new Date().toISOString();
  LastModifiedBy?: string = 'ANON';

  constructor(partial: Partial<BaseEntity>, entityType: { new (partial: Partial<BaseEntity>): BaseEntity }) {
    this.assign(partial, entityType, false);
  }

  public abstract calculateFields(): void;

  protected assign<T>(partial: Partial<T>, entityType: { new (partial: Partial<T>): T }, copyIgnored: boolean) {
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

  protected booleanConverter<T>(partial: Partial<T>, propName: keyof T) {
    if (partial[propName] !== undefined && partial[propName] !== null && typeof partial[propName] === 'number') {
      partial[propName] = (partial[propName] === 1 ? true : false) as T[keyof T];
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
