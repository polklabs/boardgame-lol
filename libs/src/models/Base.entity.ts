import { Exclude } from "class-transformer";
import { Ignore } from "../decorators/ignore.decorator";
import 'reflect-metadata'; // This must be imported here for the prod build to work

export abstract class BaseEntity {
  // These fields are all required but will be assigned by the Base.Manager
  // User should never have control over these values

  @Exclude()
  @Ignore()  
  CreatedDate?: string = new Date().toISOString();
  @Exclude()
  @Ignore()
  CreatedBy?: string = 'ANON';
  @Exclude()
  @Ignore()
  LastModifiedDate?: string = new Date().toISOString();
  @Exclude()
  @Ignore()
  LastModifiedBy?: string = 'ANON';

  constructor(partial: Partial<BaseEntity>) {
    this.assign(partial);
  }

  protected assign<T>(partial: Partial<T>) {
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
