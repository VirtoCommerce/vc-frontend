import { useQuery } from "@vue/apollo-composable";
import { GetPromotionCouponsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { QueryPromotionCouponsArgs } from "@/core/api/graphql/types";

export function getPromotionCoupons(payload?: QueryPromotionCouponsArgs) {
  const { cultureName, storeId, userId } = globals;

  return useQuery(GetPromotionCouponsDocument, {
    storeId,
    userId,
    cultureName,
    ...payload,
  });
}
