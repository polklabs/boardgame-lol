const secondaryKey = Symbol('secondaryKey');

export function SecondaryKey(target: any, propertyKey: string) {
  Reflect.defineMetadata(secondaryKey, propertyKey, target.constructor);
}

export function getSecondaryKey(target: any): string | undefined {
  return Reflect.getMetadata(secondaryKey, target);
}
