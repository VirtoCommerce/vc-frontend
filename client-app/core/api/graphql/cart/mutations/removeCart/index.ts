import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./removeCartMutation.graphql";
import { Mutations, MutationsRemoveCartArgs } from "@core/api/graphql/types";

export default async function removeCart(cartId: string): Promise<void> {
  await client.mutate<Required<Pick<Mutations, "removeCart">>, MutationsRemoveCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId,
      },
    },
  });
}
