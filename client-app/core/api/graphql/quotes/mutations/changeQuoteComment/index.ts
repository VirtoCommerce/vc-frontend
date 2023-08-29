import { graphqlClient } from "../../../client";
import mutationDocument from "./changeQuoteCommentMutation.graphql";
import type { Mutations, MutationsChangeQuoteCommentArgs, QuoteType } from "@/core/api/graphql/types";

export async function changeQuoteComment(payload: MutationsChangeQuoteCommentArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "changeQuoteComment">>,
    MutationsChangeQuoteCommentArgs
  >({
    mutation: mutationDocument,
    variables: {
      ...payload,
    },
  });

  return data!.changeQuoteComment;
}
