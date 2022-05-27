import client from "@core/api/graphql/graphql-client";
import { Mutations, MutationsMergeCartArgs } from "@core/api/graphql/types";
import mutationDocument from "./mergeCartMutation.graphql";
import { currencyCode, storeId, locale } from "@core/constants";

export default async function mergeCart(userId: string, secondCartId: string, cartId?: string): Promise<void> {
  await client.mutate<Pick<Mutations, "mergeCart">, MutationsMergeCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cartId,
        secondCartId,
        currencyCode,
        cultureName: locale,
      },
    },
  });
}
