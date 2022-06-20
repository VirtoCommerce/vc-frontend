import mutationDocument from "./removeCartItemMutation.graphql";
import { Mutations, MutationsRemoveCartItemArgs } from "@/xapi/graphql/types";
import globals from "@/core/globals";

export default async function removeCartItem(lineItemId: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "removeCartItem">>, MutationsRemoveCartItemArgs>({
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
}
