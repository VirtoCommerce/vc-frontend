import { InputAddBulkItemsType } from "@core/api/graphql/types";

export type InputBulkItemsType = Omit<InputAddBulkItemsType, "storeId" | "userId" | "cultureName" | "currencyCode">;
