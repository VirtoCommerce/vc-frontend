import globals from "@/core/globals";
import { Mutations, MutationsRemoveCartArgs } from "@/xapi/types";
import mutationDocument from "./removeCartMutation.graphql";

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
