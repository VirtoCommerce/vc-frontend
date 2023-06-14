import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./rejectGiftItemsMutation.graphql";
import type { CartType, Mutations, MutationsRejectGiftItemsArgs } from "@/core/api/graphql/types";

export async function rejectGiftItems(giftLineItemIds: string[]): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "rejectGiftItems">>,
    MutationsRejectGiftItemsArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        ids: giftLineItemIds,
      },
    },
  });

  return data!.rejectGiftItems;
}
