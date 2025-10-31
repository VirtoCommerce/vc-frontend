import { useLazyQuery } from "@vue/apollo-composable";
import { ValidateCouponDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useValidateCouponQuery(coupon: string, cartId: string) {
  const { storeId, cultureName, currencyCode, userId } = globals;
  return useLazyQuery(ValidateCouponDocument, { storeId, cultureName, currencyCode, userId, coupon, cartId });
}
