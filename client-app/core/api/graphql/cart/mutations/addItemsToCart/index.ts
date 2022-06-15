import { CartItemType } from "@/shared/cart";
import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addItemsToCartMutation.graphql";
import { Mutations, MutationsAddItemsCartArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function addItemsToCart(cartItems: CartItemType[]): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "addItemsCart">>, MutationsAddItemsCartArgs>({
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
