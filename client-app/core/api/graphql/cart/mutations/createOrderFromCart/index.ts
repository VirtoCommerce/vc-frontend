import client from "@core/api/graphql/graphql-client";
import { CustomerOrderType } from "@core/api/graphql/types";
import mutationDocument from "./createOrderFromCartMutation.graphql";

export default async function createOrderFromCart(cartId?: string): Promise<CustomerOrderType> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId: cartId,
      },
    },
  });
  return data?.createOrderFromCart;
}
