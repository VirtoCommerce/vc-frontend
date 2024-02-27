import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { OperationNames } from "@/core/api/graphql/types/operations.generated";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import { AddBulkItemsCartDocument } from "./addBulkItemsCartMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { InputNewBulkItemType, BulkCartType } from "@/core/api/graphql/types/base.generated";
import type { MaybeRef } from "vue";

export function useAddBulkItemsCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { client } = useApolloClient();
  return useMutation(
    AddBulkItemsCartDocument,
    useCartMutationVariables(cart, {
      refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
    }),
  );
}

/** @deprecated Use {@link useAddBulkItemsCartMutation} instead. */
export async function addBulkItemsCart(items: InputNewBulkItemType[]): Promise<Required<BulkCartType>> {
  const { mutate } = useAddBulkItemsCartMutation();
  const result = await mutate({ command: { cartItems: items } });
  return result!.data!.addBulkItemsCart as Required<BulkCartType>;
}
