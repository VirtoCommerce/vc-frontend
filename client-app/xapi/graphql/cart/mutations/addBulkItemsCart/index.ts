import globals from "@/core/globals";
import mutationDocument from "./addBulkItemsCartMutation.graphql";
import type { BulkCartType, InputNewBulkItemType, Mutations, MutationsAddBulkItemsCartArgs } from "@/xapi/types";

export async function addBulkItemsCart(items: InputNewBulkItemType[]): Promise<Required<BulkCartType>> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "addBulkItemsCart">>,
    MutationsAddBulkItemsCartArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        cartItems: items,
      },
    },
  });

  return <Required<BulkCartType>>data!.addBulkItemsCart;
}
