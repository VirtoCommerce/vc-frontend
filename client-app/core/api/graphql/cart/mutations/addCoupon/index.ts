import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { AddCouponDocument } from "./addCouponMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { CartType } from "@/core/api/graphql/types/base.generated";
import type { MaybeRef } from "vue";

export function useAddCouponMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(AddCouponDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useAddCouponMutation} instead. */
export async function addCoupon(couponCode: string): Promise<CartType> {
  const { mutate } = useAddCouponMutation();
  const result = await mutate({ command: { couponCode } });
  return result!.data!.addCoupon as CartType;
}
