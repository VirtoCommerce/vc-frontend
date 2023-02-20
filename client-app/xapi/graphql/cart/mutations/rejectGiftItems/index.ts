import globals from "@/core/globals";
import { Mutations, MutationsRejectGiftItemsArgs } from "@/xapi/types";
import mutationDocument from "./rejectGiftItemsMutation.graphql";

export default async function rejectGiftItems(giftLineItemIds: string[]): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "rejectGiftItems">>, MutationsRejectGiftItemsArgs>({
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
}
