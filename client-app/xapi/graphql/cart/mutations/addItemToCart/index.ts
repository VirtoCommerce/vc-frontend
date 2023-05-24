import globals from "@/core/globals";
import mutationDocument from "./addItemToCartMutation.graphql";
import type { CartType, Mutations, MutationsAddItemArgs } from "@/xapi/types";

export async function addItemToCart(productId: string, quantity: number): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "addItem">>, MutationsAddItemArgs>({
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
