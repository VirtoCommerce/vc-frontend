import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./removeCartItemMutation.graphql";
import { Mutations, MutationsRemoveCartItemArgs } from "@core/api/graphql/types";

export default async function removeCartItem(lineItemId: string): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "removeCartItem">>, MutationsRemoveCartItemArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        lineItemId,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
