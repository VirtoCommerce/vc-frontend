import mutationDocument from "./createOrderFromCartMutation.graphql";
import type { CustomerOrderType, Mutations, MutationsCreateOrderFromCartArgs } from "@/xapi/types";

export default async function createOrderFromCart(cartId?: string): Promise<CustomerOrderType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
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
