import { computed, toValue } from "vue";
import { globals } from "@/core/globals";
import type { UseMutationOptions } from "@vue/apollo-composable";
import type { ComputedRef, MaybeRefOrGetter } from "vue";

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
export function useAllGlobalVariables(): MaybeRefOrGetter<IAllGlobalVariables> {
  const { storeId, cultureName, currencyCode, userId } = globals;

  return {
    storeId,
    cultureName,
    currencyCode,
    userId,
    // cartType: "PurchaseRequest",
    // cartName: "PR240723-00026",
  };
}

export type MutationOptionsType<TResult, TVariables> = Omit<UseMutationOptions<TResult, TVariables>, "variables">;

export function useMutationVariables<TResult, TVariables>(
  variables: MaybeRefOrGetter<TVariables>,
  options: MaybeRefOrGetter<MutationOptionsType<TResult, TVariables>> = {},
): ComputedRef<UseMutationOptions<TResult, TVariables>> {
  return computed(() => ({
    variables: toValue(variables),
    ...toValue(options),
  }));
}
