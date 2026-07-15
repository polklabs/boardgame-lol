const minmax = Symbol('minmax');

export type MinMax = { [key: string]: { min: number; max: number; type: 'string' | 'number' } };

export function MinMax(min: number, max: number, type: 'string' | 'number') {
  return function (target: any, propertyKey: string) {
    const keys: MinMax = Reflect.getOwnMetadata(minmax, target.constructor) ?? {};
    keys[propertyKey] = { min, max, type };
    Reflect.defineMetadata(minmax, keys, target.constructor);
  };
}

export function getMinMax(target: any): MinMax {
  return Reflect.getOwnMetadata(minmax, target) ?? {};
}
