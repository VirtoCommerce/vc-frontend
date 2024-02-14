import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { RejectGiftItemsDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useRejectGiftItemsMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(RejectGiftItemsDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useRejectGiftItemsMutation} instead. */
export async function rejectGiftItems(giftItemIds: string[]): Promise<CartType> {
  const { mutate } = useRejectGiftItemsMutation();
  const result = await mutate({
    command: {
      ids: giftItemIds,
    },
  });
  return result!.data!.rejectGiftItems as CartType;
}
