import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./addGiftItemsMutation.graphql";
import { Mutations, MutationsAddGiftItemsArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function addGiftItems(giftIds: string[]): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "addGiftItems">>, MutationsAddGiftItemsArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        ids: giftIds,
      },
    },
  });
}
