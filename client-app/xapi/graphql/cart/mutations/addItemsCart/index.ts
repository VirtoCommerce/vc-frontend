import globals from "@/core/globals";
import mutationDocument from "./addItemsCartMutation.graphql";
import type { InputNewCartItemType, Mutations, MutationsAddItemsCartArgs } from "@/xapi/types";

export default async function addItemsCart(items: InputNewCartItemType[]): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "addItemsCart">>, MutationsAddItemsCartArgs>({
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
}
