import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { GetPromotionCouponsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { GetPromotionCouponsQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRef, MaybeRefOrGetter } from "vue";

export function getPromotionCoupons(
  payload?: MaybeRefOrGetter<Partial<GetPromotionCouponsQueryVariables>>,
  enabled?: MaybeRef<boolean>,
) {
  return useQuery(
    GetPromotionCouponsDocument,
    computed(() => {
      const { cultureName, storeId, userId } = globals;
      return {
        storeId,
        userId,
        cultureName,
        ...toValue(payload),
      };
    }),
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      keepPreviousResult: true,
      enabled,
    },
  );
}
