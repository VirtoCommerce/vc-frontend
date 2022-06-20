import { InputAddBulkItemsType } from "@/xapi/types";

export type InputBulkItemsType = Omit<InputAddBulkItemsType, "storeId" | "userId" | "cultureName" | "currencyCode">;
