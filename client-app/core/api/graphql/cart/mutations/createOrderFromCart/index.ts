import client from "@core/api/graphql/graphql-client";
import { CustomerOrderType, Mutations, MutationsCreateOrderFromCartArgs } from "@core/api/graphql/types";
import mutationDocument from "./createOrderFromCartMutation.graphql";

export default async function createOrderFromCart(cartId?: string): Promise<CustomerOrderType> {
  const { data } = await client.mutate<
    Required<Pick<Mutations, "createOrderFromCart">>,
    MutationsCreateOrderFromCartArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId,
      },
    },
  });

  return data!.createOrderFromCart;
}
