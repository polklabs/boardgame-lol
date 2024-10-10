const nullableKey = Symbol('nullableKey');

export function Nullable() {
  return function (target: any, propertyKey: string) {
    const keys: string[] = Reflect.getMetadata(nullableKey, target.constructor) ?? [];
    keys.push(propertyKey)
    Reflect.defineMetadata(nullableKey, keys, target.constructor);
  };
}

export function getNullable(target: any): string[] {
  return Reflect.getMetadata(nullableKey, target) ?? [];
}
