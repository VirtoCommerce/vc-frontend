import { CartItemType } from "@/shared/cart";
import mutationDocument from "./addItemsToCartMutation.graphql";
import { Mutations, MutationsAddItemsCartArgs } from "@/xapi/types";
import globals from "@/core/globals";

export default async function addItemsToCart(cartItems: CartItemType[]): Promise<void> {
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
        cartItems,
      },
    },
  });
}
