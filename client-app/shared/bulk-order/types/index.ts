import type { ValidationErrorType } from "@/core/api/graphql/types";

export type DuplicateSkuProductType = {
  sku: string;
  productId?: string;
  products: {
    id: string;
    name: string;
  }[];
  quantity: number;
  errors?: ValidationErrorType[];
};
