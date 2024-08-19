import type { GiftItemType, ValidationErrorType } from "@/core/api/graphql/types";

export type ExtendedGiftItemType = GiftItemType & { isAddedInCart?: boolean };

export type OutputBulkItemType = {
  productSku: string;
  quantity?: number;
  duplicateSkuErrors?: ValidationErrorType[];
  errors?: ValidationErrorType[];
};

/** @todo Rename */
export type ItemForAddBulkItemsToCartResultsModalType = {
  productId: string;
  name: string;
  quantity: number;
  sku: string;
  slug?: string;
  isAddedToCart: boolean;
  productExists: boolean;
};
