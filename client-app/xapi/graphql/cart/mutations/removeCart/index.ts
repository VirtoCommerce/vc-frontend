import globals from "@/core/globals";
import mutationDocument from "./removeCartMutation.graphql";
import type { Mutations, MutationsRemoveCartArgs } from "@/xapi/types";

export async function removeCart(cartId: string): Promise<boolean> {
  const { userId } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<Required<Pick<Mutations, "removeCart">>, MutationsRemoveCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId,
        userId,
      },
    },
  });

  return data!.removeCart;
}
