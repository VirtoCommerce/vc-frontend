import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { AddGiftItemsDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useAddGiftItemsMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(AddGiftItemsDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useAddGiftItemsMutation} instead. */
export async function addGiftItems(giftItems: string[]): Promise<CartType> {
  const { mutate } = useAddGiftItemsMutation();
  const result = await mutate({ command: { ids: giftItems } });
  return result!.data!.addGiftItems as CartType;
}
