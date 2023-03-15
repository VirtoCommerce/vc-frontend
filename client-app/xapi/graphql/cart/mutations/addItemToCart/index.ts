import globals from "@/core/globals";
import mutationDocument from "./addItemToCartMutation.graphql";
import type { Mutations, MutationsAddItemArgs } from "@/xapi/types";

export default async function addItemToCart(productId: string, quantity: number): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "addItem">>, MutationsAddItemArgs>({
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
