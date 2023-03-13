import mutationDocument from "./createQuoteFromCartMutation.graphql";
import type { Mutations, MutationsCreateQuoteFromCartArgs, QuoteType } from "@/xapi/types";

export default async function createQuoteFromCart(cartId: string, comment: string): Promise<QuoteType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "createQuoteFromCart">>,
    MutationsCreateQuoteFromCartArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId,
        comment,
      },
    },
  });

  return data!.createQuoteFromCart;
}
