import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addItemToCartMutation.graphql";
import { Mutations, MutationsAddItemArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function addItemToCart(productId: string, quantity: number): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "addItem">>, MutationsAddItemArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        productId,
        quantity,
      },
    },
  });
}
