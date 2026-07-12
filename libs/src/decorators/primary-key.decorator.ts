const primaryKey = Symbol('primaryKey');

export function PrimaryKey() {
  return function (target: any, propertyKey: string) {
    const keys: string[] = Reflect.getMetadata(primaryKey, target.constructor) ?? [];
    keys.push(propertyKey);
    Reflect.defineMetadata(primaryKey, keys, target.constructor);
  };
}

export function getPrimaryKeys(target: any): string[] {
  return Reflect.getMetadata(primaryKey, target) ?? [];
}
