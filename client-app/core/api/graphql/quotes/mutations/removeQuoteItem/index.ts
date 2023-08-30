import { graphqlClient } from "../../../client";
import mutationDocument from "./removeQuoteItemMutation.graphql";
import type { Mutations, MutationsRemoveQuoteItemArgs, QuoteType } from "@/core/api/graphql/types";

export async function removeQuoteItem(payload: MutationsRemoveQuoteItemArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
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
