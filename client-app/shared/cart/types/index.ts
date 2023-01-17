import { GiftItemType, LineItemType, ValidationErrorType, Vendor } from "@/xapi";

export type TGroupItem = { items: LineItemType[]; vendor?: Vendor };
export type TGroupedItems = Record<string, TGroupItem>;

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
