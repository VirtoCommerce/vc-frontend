import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./addGiftItemsMutation.graphql";
import { Mutations, MutationsAddGiftItemsArgs } from "@core/api/graphql/types";

export default async function addGiftItems(giftIds: string[]): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "addGiftItems">>, MutationsAddGiftItemsArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
        ids: giftIds,
      },
    },
  });
}
