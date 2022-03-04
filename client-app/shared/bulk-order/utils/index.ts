export const maxQuantity = 99999;

export function validateQuantity(value: string | number, max = maxQuantity): number {
  if (value < 0) return 0;
  if (value > max) return max;
  return Math.trunc(Number(value));
}
