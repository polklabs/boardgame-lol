const enumKey = Symbol("enum");

export type EnumValue = { [key: string]: string[] };

export function Enum<T extends readonly string[]>(enumValue: T) {
    return function (target: any, propertyKey: string) {
        const keys: EnumValue =
            Reflect.getMetadata(enumKey, target.constructor) ?? {};
        keys[propertyKey] = [...enumValue];
        Reflect.defineMetadata(enumKey, keys, target.constructor);
    };
}

export function getEnum(target: any): EnumValue {
    return Reflect.getMetadata(enumKey, target) ?? {};
}
