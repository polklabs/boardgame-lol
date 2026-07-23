export function isEmptyLike(value: unknown): boolean {
  if (value == null) {
    return true; // null or undefined
  } else if (typeof value === 'number' && value === 0) {
    return true;
  } else if (typeof value === 'string' && value.trim() === '') {
    return true;
  } else if (Array.isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}
