import { useLazyQuery } from "@vue/apollo-composable";
import { ValidateCouponDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useValidateCouponQuery(coupon: string, cartId: string) {
  return useLazyQuery(ValidateCouponDocument, { ...globals, coupon, cartId });
}
