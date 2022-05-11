import { CartItemType } from "@/shared/cart";
import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addItemsToCartMutation.graphql";
import { Mutations, MutationsAddItemsCartArgs } from "@core/api/graphql/types";

export default async function addItemsToCart(cartItems: CartItemType[]): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "addItemsCart">>, MutationsAddItemsCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
        cartItems,
      },
    },
  });
}
