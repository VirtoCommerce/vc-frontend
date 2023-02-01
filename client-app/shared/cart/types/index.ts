import { GiftItemType, ValidationErrorType } from "@/xapi";

export type ExtendedGiftItemType = GiftItemType & { isAddedInCart?: boolean };

export type OutputBulkItemType = {
  productSku: string;
  quantity?: number;
  errors?: ValidationErrorType[];
};

export type ItemForAddBulkItemsToCartResultsPopup = {
  productId: string;
  name: string;
  quantity: number;
  sku: string;
  slug?: string;
  errors?: ValidationErrorType[];
};
