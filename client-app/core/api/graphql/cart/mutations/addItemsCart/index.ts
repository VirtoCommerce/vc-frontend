import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { AddItemsCartDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQuerieNames } from "@/core/api/graphql/utils";
import type { CartType, InputNewCartItemType, CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useAddItemsCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(
    AddItemsCartDocument,
    useCartMutationVariables(cart, {
      refetchQueries: () => filterActiveQuerieNames([OperationNames.Query.GetFullCart]),
    }),
  );
}

/** @deprecated Use {@link useAddItemsCartMutation} instead. */
export async function addItemsCart(items: InputNewCartItemType[]): Promise<CartType> {
  const { mutate } = useAddItemsCartMutation();
  const result = await mutate({ command: { cartItems: items } });
  return result!.data!.addItemsCart as CartType;
}
