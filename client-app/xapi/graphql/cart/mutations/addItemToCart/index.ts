import globals from "@/core/globals";
import { Mutations, MutationsAddItemArgs } from "@/xapi/types";
import mutationDocument from "./addItemToCartMutation.graphql";

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
