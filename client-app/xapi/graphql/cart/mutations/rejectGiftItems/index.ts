import globals from "@/core/globals";
import mutationDocument from "./rejectGiftItemsMutation.graphql";
import type { CartType, Mutations, MutationsRejectGiftItemsArgs } from "@/xapi/types";

export default async function rejectGiftItems(giftLineItemIds: string[]): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
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
