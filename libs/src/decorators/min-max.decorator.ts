const minmax = Symbol('minmax');

type MinMaxTypes = 'string' | 'number' | 'array';

export type MinMaxValue = { min: number | undefined; max: number | undefined; type: MinMaxTypes };

export type MinMax = {
  [key: string]: MinMaxValue;
};

export function MinMax(min: number | undefined, max: number | undefined, type: MinMaxTypes) {
  return function (target: any, propertyKey: string) {
    const keys: MinMax = Reflect.getOwnMetadata(minmax, target.constructor) ?? {};
    keys[propertyKey] = { min, max, type };
    Reflect.defineMetadata(minmax, keys, target.constructor);
  };
}

export function getMinMax(target: any): MinMax {
  return Reflect.getOwnMetadata(minmax, target) ?? {};
}
