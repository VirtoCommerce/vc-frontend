export const maxQuantity = 999999;

export function validateQuantity(value: number, max = maxQuantity): number {
  if (value < 0) {
    return 0;
  }
  if (value > max) {
    return max;
  }
  return Number(value);
}
