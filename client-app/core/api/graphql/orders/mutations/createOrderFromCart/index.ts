import { CreateOrderFromCartDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { CreateOrderFromCartMutation, CreateOrderFromCartMutationVariables } from "@/core/api/graphql/types";

export async function createOrderFromCart(
  cartId?: string,
): Promise<CreateOrderFromCartMutation["createOrderFromCart"]> {
  const { data } = await graphqlClient.mutate<CreateOrderFromCartMutation, CreateOrderFromCartMutationVariables>({
    mutation: CreateOrderFromCartDocument,
    variables: {
      command: {
        cartId,
      },
    },
  });

  return data?.createOrderFromCart;
}
