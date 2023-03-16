import mutationDocument from "./removeQuoteItemMutation.graphql";
import type { Mutations, MutationsRemoveQuoteItemArgs, QuoteType } from "@/xapi/types";

export default async function removeQuoteItem(payload: MutationsRemoveQuoteItemArgs): Promise<QuoteType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "removeQuoteItem">>,
    MutationsRemoveQuoteItemArgs
  >({
    mutation: mutationDocument,
    variables: {
      ...payload,
    },
  });

  return data!.removeQuoteItem;
}
