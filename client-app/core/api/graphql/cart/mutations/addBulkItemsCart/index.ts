import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { AddBulkItemsCartDocument } from "@/core/api/graphql/types";
import type { BulkCartType, InputNewBulkItemType, CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useAddBulkItemsCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(AddBulkItemsCartDocument, useCartMutationVariables(cart, {}));
}

/** @deprecated Use {@link useAddBulkItemsCartMutation} instead. */
export async function addBulkItemsCart(items: InputNewBulkItemType[]): Promise<Required<BulkCartType>> {
  const { mutate } = useAddBulkItemsCartMutation();
  const result = await mutate({ command: { cartItems: items } });
  return result!.data!.addBulkItemsCart as Required<BulkCartType>;
}
