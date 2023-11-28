import { globals } from "@/core/globals";
import type { MaybeRef } from "vue";

export interface IAllGlobalVariables {
  storeId: string;
  cultureName: string;
  currencyCode: string;
  userId: string;
}

/**
 * Returns all global variables.
 * Now these variables are just strings, because we reload the page on sign in / sign out,
 * but in future we should update them without page reload and they will become reactive.
 */
export function useAllGlobalVariables(): MaybeRef<IAllGlobalVariables> {
  const { storeId, cultureName, currencyCode, userId } = globals;

  return {
    storeId,
    cultureName,
    currencyCode,
    userId,
  };
}
