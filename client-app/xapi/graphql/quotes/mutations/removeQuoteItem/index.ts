import { Mutations, MutationsRemoveQuoteItemArgs, QuoteType } from "@/xapi/types";
import mutationDocument from "./removeQuoteItemMutation.graphql";

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
