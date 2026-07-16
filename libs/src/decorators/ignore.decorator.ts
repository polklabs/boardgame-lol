const ignoreKey = Symbol('ignoreKey');

export function Ignore() {
  return function (target: any, propertyKey: string) {
    const keys: string[] = Reflect.getOwnMetadata(ignoreKey, target.constructor) ?? [];
    keys.push(propertyKey)
    Reflect.defineMetadata(ignoreKey, keys, target.constructor);
  };
}

export function getIgnore(target: any): string[] {
  return Reflect.getOwnMetadata(ignoreKey, target) ?? [];
}
