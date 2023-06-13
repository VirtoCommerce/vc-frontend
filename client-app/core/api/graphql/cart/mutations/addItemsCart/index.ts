import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./addItemsCartMutation.graphql";
import type { CartType, InputNewCartItemType, Mutations, MutationsAddItemsCartArgs } from "@/core/api/graphql/types";

export async function addItemsCart(items: InputNewCartItemType[]): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "addItemsCart">>, MutationsAddItemsCartArgs>({
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

  return data!.addItemsCart;
}
