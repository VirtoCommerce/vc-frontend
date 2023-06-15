import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./removeCartMutation.graphql";
import type { Mutations, MutationsRemoveCartArgs } from "@/core/api/graphql/types";

export async function removeCart(cartId: string): Promise<boolean> {
  const { userId } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "removeCart">>, MutationsRemoveCartArgs>({
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
