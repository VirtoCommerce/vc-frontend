import { useLazyQuery } from "@vue/apollo-composable";
import { GetLoyaltyBalanceDocument } from "@/core/api/graphql/types";
import type { GetLoyaltyBalanceQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useGetLoyaltyBalance(payload: MaybeRefOrGetter<GetLoyaltyBalanceQueryVariables>) {
  return useLazyQuery(GetLoyaltyBalanceDocument, payload, { fetchPolicy: "cache-and-network" });
}
