import { getPrimaryKey } from './primary-key.decorator';
import { getSecondaryKey } from './secondary-key.decorator';
import { getTableName } from './table-name.decorator';

const foreignKey = Symbol('foreignKey');

type ForeignKeyType = { [key: string]: any };

export function ForeignKey<T>(entityClass: { new (partial: Partial<T>): T }) {
  return function (target: any, propertyKey: string) {
    const keys: ForeignKeyType = Reflect.getMetadata(foreignKey, target.constructor) ?? {};
    keys[propertyKey] = entityClass;
    Reflect.defineMetadata(foreignKey, keys, target.constructor);
  };
}

export function getForeignKeys(target: any) {
  const toReturn = Reflect.getMetadata(foreignKey, target) ?? {};
  return Object.keys(toReturn);
}

export function getForeignKey(target: any, propertyKey: string) {
  const toReturn = Reflect.getMetadata(foreignKey, target.constructor) ?? {};
  const fk = toReturn[propertyKey];
  if (fk) {
    return { tableName: getTableName(fk), primaryKey: getPrimaryKey(fk), secondaryKey: getSecondaryKey(fk) };
  } else {
    return undefined;
  }
}
