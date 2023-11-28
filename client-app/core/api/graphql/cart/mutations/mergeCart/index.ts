import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { MergeCartDocument } from "@/core/api/graphql/types";
import type { CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useMergeCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(MergeCartDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useMergeCartMutation} instead. */
export async function mergeCart(userId: string, secondCartId: string, cartId?: string): Promise<void> {
  const { mutate } = useMergeCartMutation(cartId ? { id: cartId } : undefined);
  await mutate({
    command: {
      secondCartId,
    },
  });
}
