import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { OperationNames } from "@/core/api/graphql/types/operations.generated";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { AddItemsCartDocument } from "./addItemsCartMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { CartType, InputNewCartItemType } from "@/core/api/graphql/types/base.generated";
import type { MaybeRef } from "vue";

export function useAddItemsCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { client } = useApolloClient();
  return useMutation(
    AddItemsCartDocument,
    useCartMutationVariables(cart, {
      refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
    }),
  );
}

/** @deprecated Use {@link useAddItemsCartMutation} instead. */
export async function addItemsCart(items: InputNewCartItemType[]): Promise<CartType> {
  const { mutate } = useAddItemsCartMutation();
  const result = await mutate({ command: { cartItems: items } });
  return result!.data!.addItemsCart as CartType;
}
