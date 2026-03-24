export function createPrefixedId(prefix: string, digits: number): string {
  const factor = 10 ** digits;
  const min = 10 ** (digits - 1);
  const random = Math.floor(min + Math.random() * (factor - min));
  return `${prefix}-${random}`;
}
