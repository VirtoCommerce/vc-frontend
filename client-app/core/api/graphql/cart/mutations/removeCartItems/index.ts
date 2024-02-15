import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { RemoveCartItemsDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useRemoveCartItemsMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(RemoveCartItemsDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useRemoveCartItemsMutation} instead. */
export async function removeCartItems(lineItemIds: string[]): Promise<CartType> {
  const { mutate } = useRemoveCartItemsMutation();
  const result = await mutate({
    command: {
      lineItemIds,
    },
  });
  return result!.data!.removeCartItems as CartType;
}
