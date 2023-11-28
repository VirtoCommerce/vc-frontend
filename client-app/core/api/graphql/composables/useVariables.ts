import { globals } from "@/core/globals";

export interface IAllGlobalVariables {
  storeId: string;
  cultureName: string;
  currencyCode: string;
  userId: string;
}

export function useAllGlobalVariables(): IAllGlobalVariables {
  const { storeId, cultureName, currencyCode, userId } = globals;

  return {
    storeId,
    cultureName,
    currencyCode,
    userId,
  };
}
