import mutationDocument from "./changeQuoteCommentMutation.graphql";
import type { Mutations, MutationsChangeQuoteCommentArgs, QuoteType } from "@/xapi/types";

export default async function changeQuoteComment(payload: MutationsChangeQuoteCommentArgs): Promise<QuoteType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
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
