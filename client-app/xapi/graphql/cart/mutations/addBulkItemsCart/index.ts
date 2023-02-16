import globals from "@/core/globals";
import { BulkCartType, InputNewBulkItemType, Mutations, MutationsAddBulkItemsCartArgs } from "@/xapi";
import mutationDocument from "./addBulkItemsCartMutation.graphql";

export default async function addBulkItemsCart(items: InputNewBulkItemType[]): Promise<BulkCartType> {
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

  return data!.addBulkItemsCart;
}
