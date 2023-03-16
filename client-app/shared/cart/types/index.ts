import type { GiftItemType, ValidationErrorType } from "@/xapi/types";

export type ExtendedGiftItemType = GiftItemType & { isAddedInCart?: boolean };

export type OutputBulkItemType = {
  productSku: string;
  quantity?: number;
  errors?: ValidationErrorType[];
};

/** @todo Rename */
export type ItemForAddBulkItemsToCartResultsPopupType = {
  productId: string;
  name: string;
  quantity: number;
  sku: string;
  slug?: string;
  errors?: ValidationErrorType[];
};
