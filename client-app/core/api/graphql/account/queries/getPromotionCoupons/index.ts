import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { GetPromotionCouponsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { GetPromotionCouponsQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export interface IGetPromotionCouponsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export function getPromotionCoupons(payload?: MaybeRefOrGetter<Partial<GetPromotionCouponsQueryVariables>>) {
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
    },
  );
}
