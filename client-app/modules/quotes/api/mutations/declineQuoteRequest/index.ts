import { graphqlClient } from "@/core/api/graphql/client";
import mutationDocument from "./declineQuoteRequestMutation.graphql";
import type { Mutations, MutationsDeclineQuoteRequestArgs, QuoteType } from "../../types";

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
