import { graphqlClient } from "../../../client";
import { CreateOrderFromCartDocument } from "./createOrderFromCartMutation.generated";
import type { CustomerOrderType, Mutations, MutationsCreateOrderFromCartArgs } from "@/core/api/graphql/types";

export async function createOrderFromCart(cartId?: string): Promise<CustomerOrderType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "createOrderFromCart">>,
    MutationsCreateOrderFromCartArgs
  >({
    mutation: CreateOrderFromCartDocument,
    variables: {
      command: {
        cartId,
      },
    },
  });

  return data!.createOrderFromCart;
}
