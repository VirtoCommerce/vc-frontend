import mutationDocument from "./addItemsCartMutation.graphql";
import { InputNewCartItemType, Mutations, MutationsAddItemsCartArgs } from "@/xapi";
import globals from "@/core/globals";

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
