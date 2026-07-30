import { getTableName } from '../decorators/table-name.decorator';

/** TableName.Property */
export function TP<T>(entityType: new (partial: Partial<T>) => T, key?: keyof T | '*') {
  if (key) {
    return `${getTableName(entityType)}.${String(key)}`;
  } else {
    return `${getTableName(entityType)}`;
  }
}
