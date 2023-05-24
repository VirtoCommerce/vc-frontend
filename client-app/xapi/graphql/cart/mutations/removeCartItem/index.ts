import globals from "@/core/globals";
import mutationDocument from "./removeCartItemMutation.graphql";
import type { CartType, Mutations, MutationsRemoveCartItemArgs } from "@/xapi/types";

export async function removeCartItem(lineItemId: string): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "removeCartItem">>,
    MutationsRemoveCartItemArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        lineItemId,
      },
    },
  });

  return data!.removeCartItem;
}
