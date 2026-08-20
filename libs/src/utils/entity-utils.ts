import { getTableName } from '../decorators/table-name.decorator';

/** TableName.Property */
export function TP<T>(entityType: new (partial: Partial<T>) => T, key?: keyof T) {
  return TPRaw(getTableName(entityType)!, key);
}

/** TableName.Property */
export function TPRaw<T>(tableName: string, key?: keyof T) {
  if (key) {
    const keyString = String(key);
    return `${tableName}.${keyString}`;
  } else {
    return `${tableName}`;
  }
}

export function TW<T>(entityType: new (partial: Partial<T>) => T, key: keyof T) {
  return TWRaw(getTableName(entityType)!, key);
}

/** TableName.Property */
export function TWRaw<T>(tableName: string, key: keyof T) {
  const keyString = String(key);
  return `${tableName}.${keyString} = ${VAR(keyString)}`;
}

export function TS<T>(entityType: new (partial: Partial<T>) => T, key: keyof T) {
  return TSRaw(getTableName(entityType)!, key);
}

export function TSRaw<T>(tableName: string, key: keyof T) {
  const keyString = String(key);
  if (keyString.endsWith('Id') || keyString === 'CreatedBy' || keyString === 'LastModifiedBy') {
    return `hex(${tableName}.${keyString}) AS ${keyString}`;
  } else {
    return `${tableName}.${keyString}`;
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
