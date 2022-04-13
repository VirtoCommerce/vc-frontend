import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./changeCartItemQuantityMutation.graphql";
import { Mutations, MutationsChangeCartItemQuantityArgs } from "@core/api/graphql/types";

export default async function changeCartItemQuantity(lineItemId: string, quantity: number): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "changeCartItemQuantity">>, MutationsChangeCartItemQuantityArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        lineItemId,
        quantity,
        storeId,
        currencyCode,
        cultureName: locale,
        userId: currentUserId,
      },
    },
  });
}
