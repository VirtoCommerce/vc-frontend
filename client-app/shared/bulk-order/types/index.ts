import type { ErrorType } from "@/core/composables";

export type DuplicateSkuProductType = {
  sku: string;
  productId?: string;
  products: {
    id: string;
    name: string;
  }[];
  quantity: number;
  errors?: ErrorType[];
};
