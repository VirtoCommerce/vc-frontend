import { useQuery } from "@vue/apollo-composable";
import { computed, toValue } from "vue";
import { GetPromotionCouponsDocument } from "@/core/api/graphql/types";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { globals } from "@/core/globals";
import type { MaybeRefOrGetter } from "vue";

export interface IGetPromotionCouponsParams {
  page?: number;
  sort?: string;
}

export function getPromotionCoupons(params?: MaybeRefOrGetter<IGetPromotionCouponsParams>) {
  return useQuery(
    GetPromotionCouponsDocument,
    computed(() => {
      const { cultureName, storeId, userId } = globals;
      const { page = 1, sort } = toValue(params) ?? {};
      return {
        storeId,
        userId,
        cultureName,
        sort,
        first: DEFAULT_PAGE_SIZE,
        after: String((page - 1) * DEFAULT_PAGE_SIZE),
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
