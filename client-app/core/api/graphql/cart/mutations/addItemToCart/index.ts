import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { AddItemDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import type { CartType, CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useAddItemToCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { client } = useApolloClient();
  return useMutation(
    AddItemDocument,
    useCartMutationVariables(cart, {
      refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
    }),
  );
}

/** @deprecated Use {@link useAddItemToCartMutation} instead. */
export async function addItemToCart(productId: string, quantity: number): Promise<CartType> {
  const { mutate } = useAddItemToCartMutation();
  const result = await mutate({
    command: {
      productId,
      quantity,
    },
  });
  return result!.data!.addItem as CartType;
}
