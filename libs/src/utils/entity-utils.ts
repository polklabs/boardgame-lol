import { getTableName } from '../decorators/table-name.decorator';

/** TableName.Property */
export function TP<T>(
  entityType: new (partial: Partial<T>) => T,
  key?: keyof T,
  type: 'none' | 'select' | 'where' = 'none',
) {
  return TPRaw(getTableName(entityType)!, key, type);
}

/** TableName.Property */
export function TPRaw<T>(tableName: string, key?: keyof T, type: 'none' | 'select' | 'where' = 'none') {
  if (key) {
    const keyString = String(key);
    if (
      type === 'select' &&
      (keyString.endsWith('Id') || keyString === 'CreatedBy' || keyString === 'LastModifiedBy')
    ) {
      return `hex(${tableName}.${keyString}) AS ${keyString}`;
    } else if (type === 'where') {
      return `${tableName}.${keyString} = ${VAR(keyString)}`;
    } else {
      return `${tableName}.${keyString}`;
    }
  } else {
    return `${tableName}`;
  }
}

export function VAR(key: string) {
  if (key.endsWith('Id') || key === 'CreatedBy' || key === 'LastModifiedBy') {
    return 'unhex(?)';
  } else if (key === 'CreatedDate' || key === 'LastModifiedDate') {
    return `unixepoch(?)`;
  } else {
    return '?';
  }
}
