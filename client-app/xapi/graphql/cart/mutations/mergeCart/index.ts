import globals from "@/core/globals";
import mutationDocument from "./mergeCartMutation.graphql";
import type { Mutations, MutationsMergeCartArgs } from "@/xapi/types";

export default async function mergeCart(userId: string, secondCartId: string, cartId?: string): Promise<void> {
  const { storeId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Pick<Mutations, "mergeCart">, MutationsMergeCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        cartId,
        secondCartId,
      },
    },
  });
}
