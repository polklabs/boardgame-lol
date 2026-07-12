import { getPrimaryKey } from '../decorators/primary-key.decorator';

export function Mode<T>(arr: Array<T>, predicate: (elem: T) => string | number) {
  const counts: { [key: string | number]: { e: T; count: number } } = {};
  arr.forEach(function (e) {
    const k = predicate(e);
    if (counts[k] === undefined) {
      counts[k] = { e, count: 0 };
    } else {
      // Continue
    }
    counts[k].count++;
  });

  let max = 0;
  let maxKeys: (string | number)[] = [];
  Object.keys(counts).forEach((key) => {
    if (counts[key].count > max) {
      max = counts[key].count;
      maxKeys = [key];
    } else if (counts[key].count === max) {
      maxKeys.push(key);
    } else {
      // Continue
    }
  });

  if (maxKeys.length > 0) {
    return maxKeys.map((key) => counts[key].e);
  } else {
    return [];
  }
}

export function GetRandom<T>(list: T[]): T | undefined {
  if (list.length > 0) {
    return list[Math.floor(Math.random() * list.length)];
  } else {
    return undefined;
  }
}

export function UnicodeToEmoji(unicode: string): string {
  const codePoints = unicode
    .trim()
    .split(/\s+/)
    .map((cp) => Number.parseInt(cp.replace('U+', ''), 16));

  return String.fromCodePoint(...codePoints);
}

export function ConvertListToDict<T>(list: T[], entityType: new (partial: Partial<T>) => T): Record<string, T> {
  const toReturn: Record<string, T> = {};
  const primaryKey = getPrimaryKey(entityType) as keyof T;

  list.forEach((item) => {
    toReturn[(item[primaryKey] as string) ?? ''] = item;
  });

  return toReturn;
}
