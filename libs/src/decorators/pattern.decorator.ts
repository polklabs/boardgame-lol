const patternKey = Symbol('patternKey');

export type PatternValue = { [key: string]: { regex: string | RegExp; desc: string } };

export function Pattern(regex: string | RegExp, desc: string) {
  return function (target: any, propertyKey: string) {
    const keys: PatternValue = Reflect.getMetadata(patternKey, target.constructor) ?? {};
    keys[propertyKey] = { regex, desc };
    Reflect.defineMetadata(patternKey, keys, target.constructor);
  };
}

export function getPattern(target: any): PatternValue {
  return Reflect.getMetadata(patternKey, target) ?? {};
}
