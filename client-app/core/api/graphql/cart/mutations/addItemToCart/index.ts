import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./addItemToCartMutation.graphql";
import type { CartType, Mutations, MutationsAddItemArgs } from "@/core/api/graphql/types";

export async function addItemToCart(productId: string, quantity: number): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "addItem">>, MutationsAddItemArgs>({
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

  return data!.addItem;
}
