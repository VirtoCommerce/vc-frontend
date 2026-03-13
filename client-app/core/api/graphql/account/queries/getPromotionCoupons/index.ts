import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { GetPromotionCouponsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { QueryPromotionCouponsArgs } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function getPromotionCoupons(
  variables?: MaybeRefOrGetter<Omit<QueryPromotionCouponsArgs, "storeId" | "userId" | "cultureName">>,
) {
  return useQuery(
    GetPromotionCouponsDocument,
    computed(() => {
      const { cultureName, storeId, userId } = globals;
      return {
        storeId,
        userId,
        cultureName,
        ...toValue(variables),
      };
    }),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      keepPreviousResult: true,
    },
  );
}
