import client from "@core/api/graphql/graphql-client";
import { Mutations, MutationsMergeCartArgs } from "@core/api/graphql/types";
import mutationDocument from "./mergeCartMutation.graphql";
import globals from "@core/globals";

export default async function mergeCart(userId: string, secondCartId: string, cartId?: string): Promise<void> {
  const { storeId, cultureName, currencyCode } = globals;

  await client.mutate<Pick<Mutations, "mergeCart">, MutationsMergeCartArgs>({
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
