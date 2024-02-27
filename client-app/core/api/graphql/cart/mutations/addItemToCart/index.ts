import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { OperationNames } from "@/core/api/graphql/types/operations.generated";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { AddItemDocument } from "./addItemToCartMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { CartType } from "@/core/api/graphql/types/base.generated";
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
