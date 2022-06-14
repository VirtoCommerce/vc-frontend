import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./rejectGiftItemsMutation.graphql";
import { Mutations, MutationsRejectGiftItemsArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function rejectGiftItems(giftIds: string[]): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "rejectGiftItems">>, MutationsRejectGiftItemsArgs>({
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
