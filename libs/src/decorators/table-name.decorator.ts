const tableName = Symbol('tableName');

export function TableName(name: string) {
  return function (target: any) {
    // Store the table name in a metadata key
    Reflect.defineMetadata(tableName, name, target);
  };
}

export function getTableName(target: any): string | undefined {
  // Retrieve the table name from the metadata
  return Reflect.getMetadata(tableName, target);
}
