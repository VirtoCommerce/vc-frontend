import mutationDocument from "./addGiftItemsMutation.graphql";
import { Mutations, MutationsAddGiftItemsArgs } from "@/xapi/types";
import globals from "@/core/globals";

export default async function addGiftItems(giftIds: string[]): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "addGiftItems">>, MutationsAddGiftItemsArgs>({
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
