import { getTableName } from '../decorators/table-name.decorator';

/** TableName.Property */
export function TP<T>(entityType: { new (partial: Partial<T>): T }, key: keyof T) {
  return `${getTableName(entityType)}.${String(key)}`;
}

/** TableName */
export function T<T>(entityType: { new (partial: Partial<T>): T }) {
  return `${getTableName(entityType)}`;
}

/** Property */
export function P<T>(entityType: { new (partial: Partial<T>): T }, key: keyof T) {
    return `${getTableName(entityType)}.${String(key)}`;
  }