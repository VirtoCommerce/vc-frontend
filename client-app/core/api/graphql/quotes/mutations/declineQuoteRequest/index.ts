import { graphqlClient } from "../../../client";
import mutationDocument from "./declineQuoteRequestMutation.graphql";
import type { Mutations, MutationsDeclineQuoteRequestArgs, QuoteType } from "@/core/api/graphql/types";

export async function declineQuoteRequest(payload: MutationsDeclineQuoteRequestArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "declineQuoteRequest">>,
    MutationsDeclineQuoteRequestArgs
  >({
    mutation: mutationDocument,
    variables: {
      ...payload,
    },
  });

  return data!.declineQuoteRequest;
}
