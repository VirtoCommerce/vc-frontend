import { graphqlClient } from "../../../client";
import mutationDocument from "./changeQuoteItemQuantityMutation.graphql";
import type { Mutations, MutationsChangeQuoteItemQuantityArgs, QuoteType } from "@/core/api/graphql/types";

export async function changeQuoteItemQuantity(payload: MutationsChangeQuoteItemQuantityArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
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
