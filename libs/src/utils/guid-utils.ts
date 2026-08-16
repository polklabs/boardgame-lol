const guidRegex =
  /^(?<first>[a-fA-F\d]{8})-?(?<second>[a-fA-F\d]{4})-?(?<third>[a-fA-F\d]{4})-?(?<fourth>[a-fA-F\d]{4})-?(?<fifth>[a-fA-F\d]{12})$/gm;

export function isGuid(guid: string | undefined | null): boolean {
  if (!guid || (guid.length !== 36 && guid.length !== 32)) {
    return false;
  } else {
    return new RegExp(guidRegex).test(guid);
  }
}

export function newGuid(): string {
  return crypto.randomUUID().replaceAll('-', '');
}
