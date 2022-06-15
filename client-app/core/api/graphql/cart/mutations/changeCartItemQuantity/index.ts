import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./changeCartItemQuantityMutation.graphql";
import { Mutations, MutationsChangeCartItemQuantityArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function changeCartItemQuantity(lineItemId: string, quantity: number): Promise<void> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  await client.mutate<Required<Pick<Mutations, "changeCartItemQuantity">>, MutationsChangeCartItemQuantityArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        lineItemId,
        quantity,
      },
    },
  });
}
