import { graphqlClient } from "../../../client";
import { SubmitQuoteRequestDocument } from "./submitQuoteRequestMutation.generated";
import type { Mutations, MutationsSubmitQuoteRequestArgs, QuoteType } from "@/core/api/graphql/types";

export async function submitQuoteRequest(payload: MutationsSubmitQuoteRequestArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "submitQuoteRequest">>,
    MutationsSubmitQuoteRequestArgs
  >({
    mutation: SubmitQuoteRequestDocument,
    variables: {
      ...payload,
    },
  });

  return data!.submitQuoteRequest;
}
