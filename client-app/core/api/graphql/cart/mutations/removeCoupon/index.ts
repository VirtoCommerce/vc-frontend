import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { RemoveCouponDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useRemoveCouponMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(RemoveCouponDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useRemoveCouponMutation} instead. */
export async function removeCoupon(couponCode: string): Promise<CartType> {
  const { mutate } = useRemoveCouponMutation();

  const result = await mutate({
    command: {
      couponCode,
    },
  });
  return result!.data!.removeCoupon as CartType;
}
