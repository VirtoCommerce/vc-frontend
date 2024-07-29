import { useLazyQuery } from "@vue/apollo-composable";
import { toValue } from "vue";
import { useCartQueryVariables } from "@/core/api/graphql/cart/composables";
import { ValidateCouponDocument } from "@/core/api/graphql/types";

export function useValidateCouponQuery(coupon: string, cartId: string) {
  const cartQueryVariables = toValue(useCartQueryVariables());
  return useLazyQuery(ValidateCouponDocument, { ...cartQueryVariables, coupon, cartId });
}
