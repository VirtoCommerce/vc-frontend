import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./removeCartItemMutation.graphql";
import { Mutations, MutationsRemoveCartItemArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function removeCartItem(lineItemId: string): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "removeCartItem">>, MutationsRemoveCartItemArgs>({
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
