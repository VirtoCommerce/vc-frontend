import { InputAddBulkItemsType } from "@/xapi/graphql/types";

export type InputBulkItemsType = Omit<InputAddBulkItemsType, "storeId" | "userId" | "cultureName" | "currencyCode">;
