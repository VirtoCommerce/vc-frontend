import type { GiftItemType } from "@/core/api/graphql/types";

export type ExtendedGiftItemType = GiftItemType & { isAddedInCart?: boolean };

export type OutputBulkItemType = {
  productSku: string;
  quantity?: number;
  isAddedToCart?: boolean;
};

/** @todo Rename */
export type ItemForAddBulkItemsToCartResultsPopupType = {
  productId: string;
  name: string;
  quantity: number;
  sku: string;
  slug?: string;
  isAddedToCart: boolean;
};
