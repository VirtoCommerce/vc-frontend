import { computed, readonly } from "vue";
import { useGetLoyaltyBalance } from "@/core/api/graphql";
import type { MaybeRefOrGetter } from "@vueuse/core";
import type { GetLoyaltyBalanceQueryVariables } from "@/core/api/graphql/types";

export function useLoyaltyBalance(payload: MaybeRefOrGetter<GetLoyaltyBalanceQueryVariables>) {
  const { loading, result, load, refetch } = useGetLoyaltyBalance(payload);

  return {
    loading: readonly(loading),
    currentBalance: computed(() => result.value?.loyaltyBalance?.currentBalance),
    resultBalance: computed(() => result.value?.loyaltyBalance?.resultBalance),
    loadLoyaltyBalance: async () => (await load()) || (await refetch()),
  };
}
