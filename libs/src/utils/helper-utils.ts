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
