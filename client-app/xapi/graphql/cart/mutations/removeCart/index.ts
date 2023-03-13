import globals from "@/core/globals";
import mutationDocument from "./removeCartMutation.graphql";
import type { Mutations, MutationsRemoveCartArgs } from "@/xapi/types";

export default async function removeCart(cartId: string): Promise<void> {
  const { userId } = globals;
  const { $graphqlClient } = useNuxtApp();

  await $graphqlClient.mutate<Required<Pick<Mutations, "removeCart">>, MutationsRemoveCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId,
        userId,
      },
    },
  });
}
