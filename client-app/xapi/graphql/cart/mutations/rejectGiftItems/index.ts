import mutationDocument from "./rejectGiftItemsMutation.graphql";
import { Mutations, MutationsRejectGiftItemsArgs } from "@/xapi/types";
import globals from "@/core/globals";

export default async function rejectGiftItems(giftIds: string[]): Promise<void> {
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
        ids: giftIds,
      },
    },
  });
}
