import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./rejectGiftItemsMutation.graphql";
import { Mutations, MutationsRejectGiftItemsArgs } from "@core/api/graphql/types";

export default async function rejectGiftItems(giftIds: string[]): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "rejectGiftItems">>, MutationsRejectGiftItemsArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        ids: giftIds,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
