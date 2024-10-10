const sanitizeKey = Symbol('sanitizeKey');

export type SanitizeTags = { [key: string]: string[] };

export function Sanitize(allowedTags: string[] = []) {
  return function (target: any, propertyKey: string) {
    const keys: SanitizeTags = Reflect.getMetadata(sanitizeKey, target.constructor) ?? {};
    keys[propertyKey] = allowedTags;
    Reflect.defineMetadata(sanitizeKey, keys, target.constructor);
  };
}

export function getSanitize(target: any): SanitizeTags {
  return Reflect.getMetadata(sanitizeKey, target) ?? {};
}
