import globals from "@/core/globals";
import mutationDocument from "./addGiftItemsMutation.graphql";
import type { CartType, Mutations, MutationsAddGiftItemsArgs } from "@/xapi/types";

export async function addGiftItems(giftIds: string[]): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "addGiftItems">>, MutationsAddGiftItemsArgs>({
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

  return data!.addGiftItems;
}
