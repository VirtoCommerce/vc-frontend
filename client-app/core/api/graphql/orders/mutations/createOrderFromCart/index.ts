import { CreateOrderFromCartDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { FullOrderFieldsFragment } from "@/core/api/graphql/types";

export async function createOrderFromCart(cartId?: string): Promise<FullOrderFieldsFragment | void> {
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
