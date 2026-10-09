import { CreateOrderFromCartDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";

export async function createOrderFromCart(cartId?: string) {
  const { data } = await graphqlClient.mutate({
    mutation: CreateOrderFromCartDocument,
    variables: {
      command: {
        cartId,
      },
    },
  });

  return data?.createOrderFromCart;
}
