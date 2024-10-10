const primaryKey = Symbol('primaryKey');

export function PrimaryKey(target: any, propertyKey: string) {
  Reflect.defineMetadata(primaryKey, propertyKey, target.constructor);
}

export function getPrimaryKey(target: any): string | undefined {
  return Reflect.getMetadata(primaryKey, target);
}
