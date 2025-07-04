import { globals } from "@/core/globals";
import type { MaybeRefOrGetter } from "vue";

export interface IAllGlobalVariables {
  storeId: string;
  cultureName: string;
  currencyCode: string;
  userId: string;
}

/**
 * @deprecated Use {@link globals} directly instead.
 */
export function useAllGlobalVariables(): MaybeRefOrGetter<IAllGlobalVariables> {
  const { storeId, cultureName, currencyCode, userId } = globals;

  return {
    storeId,
    cultureName,
    currencyCode,
    userId,
  };
}
