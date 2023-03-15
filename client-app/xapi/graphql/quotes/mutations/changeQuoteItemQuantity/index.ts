import mutationDocument from "./changeQuoteItemQuantityMutation.graphql";
import type { Mutations, MutationsChangeQuoteItemQuantityArgs, QuoteType } from "@/xapi/types";

export default async function changeQuoteItemQuantity(
  payload: MutationsChangeQuoteItemQuantityArgs
): Promise<QuoteType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "changeQuoteItemQuantity">>,
    MutationsChangeQuoteItemQuantityArgs
  >({
    mutation: mutationDocument,
    variables: {
      ...payload,
    },
  });

  return data!.changeQuoteItemQuantity;
}
