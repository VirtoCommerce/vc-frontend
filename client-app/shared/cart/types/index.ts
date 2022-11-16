import { ValidationErrorType } from "@/xapi";

export type OutputBulkItemType = {
  productSku: string;
  errors?: ValidationErrorType[];
};
