export function shouldUseActualPrice(listPrice?: { amount: number }, actualPrice?: { amount: number }): boolean {
  return !!listPrice && !!actualPrice && listPrice.amount > actualPrice.amount;
}
