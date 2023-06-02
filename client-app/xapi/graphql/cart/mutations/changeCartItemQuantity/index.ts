import globals from "@/core/globals";
import mutationDocument from "./changeCartItemQuantityMutation.graphql";
import type { CartType, Mutations, MutationsChangeCartItemQuantityArgs } from "@/xapi/types";

export default async function changeCartItemQuantity(lineItemId: string, quantity: number): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "changeCartItemQuantity">>,
    MutationsChangeCartItemQuantityArgs
  >({
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

  return data!.changeCartItemQuantity;
}
