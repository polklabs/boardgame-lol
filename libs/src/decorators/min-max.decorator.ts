const minmax = Symbol('minmax');

type MinMaxTypes = 'string' | 'number' | 'array';

export type MinMax = { [key: string]: { min: number; max: number; type: MinMaxTypes } };

export function MinMax(min: number, max: number, type: MinMaxTypes) {
  return function (target: any, propertyKey: string) {
    const keys: MinMax = Reflect.getOwnMetadata(minmax, target.constructor) ?? {};
    keys[propertyKey] = { min, max, type };
    Reflect.defineMetadata(minmax, keys, target.constructor);
  };
}

export function getMinMax(target: any): MinMax {
  return Reflect.getOwnMetadata(minmax, target) ?? {};
}
