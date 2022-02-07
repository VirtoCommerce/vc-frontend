import client from "@core/api/graphql/graphql-client";
import mutationDocument from "./removeCartMutation.graphql";

export default async function removeCart(cartId?: string): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId: cartId,
      },
    },
  });
}
