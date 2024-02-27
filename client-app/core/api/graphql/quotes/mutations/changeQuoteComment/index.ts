import { graphqlClient } from "../../../client";
import { ChangeQuoteCommentDocument } from "./changeQuoteCommentMutation.generated";
import type { Mutations, MutationsChangeQuoteCommentArgs, QuoteType } from "@/core/api/graphql/types";

export async function changeQuoteComment(payload: MutationsChangeQuoteCommentArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "changeQuoteComment">>,
    MutationsChangeQuoteCommentArgs
  >({
    mutation: ChangeQuoteCommentDocument,
    variables: {
      ...payload,
    },
  });

  return data!.changeQuoteComment;
}
