import type { AvailabilityData, VariationType } from "@/core/api/graphql/types";

type VariationsHolderType = { variations?: VariationType[] };
type PurchasableType = { availabilityData?: AvailabilityData };

function isPurchasable(entry: PurchasableType): boolean {
  return !!entry.availabilityData?.isInStock && !!entry.availabilityData.isBuyable;
}

/**
 * A product is one of its own variations, so the count is always one more than the `variations` array.
 */
export function getVariationsCount(item: VariationsHolderType): number {
  return (item.variations?.length ?? 0) + 1;
}

/**
 * The same count narrowed to entries a shopper can actually buy, for when the "in stock" filter is on.
 * Unlike {@link getVariationsCount} this can return 0.
 */
export function getPurchasableVariationsCount(product: VariationsHolderType & PurchasableType): number {
  const self = isPurchasable(product) ? 1 : 0;

  return self + (product.variations?.filter(isPurchasable).length ?? 0);
}
