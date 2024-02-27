import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ValidateCouponDocument } from "./validateCouponMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { MaybeRef } from "vue";

export function useValidateCouponMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(ValidateCouponDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useValidateCouponMutation} instead. */
export async function validateCoupon(coupon: string): Promise<boolean> {
  const { mutate } = useValidateCouponMutation();

  const result = await mutate({
    command: {
      coupon,
    },
  });
  return result!.data!.validateCoupon!;
}
