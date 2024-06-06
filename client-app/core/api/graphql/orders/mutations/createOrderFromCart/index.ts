import { graphqlClient } from "../../../client";
import mutationDocument from "./createOrderFromCartMutation.graphql";
import type { MutationsCreateOrderFromCartArgs, CreateOrderFromCartMutation } from "@/core/api/graphql/types";

export async function createOrderFromCart(
  cartId?: string,
): Promise<CreateOrderFromCartMutation["createOrderFromCart"]> {
  const { data } = await graphqlClient.mutate<CreateOrderFromCartMutation, MutationsCreateOrderFromCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId,
      },
    },
  });

  return data?.createOrderFromCart;
}
