import { Mutations, MutationsSubmitQuoteRequestArgs, QuoteType } from "@/xapi/types";
import mutationDocument from "./submitQuoteRequestMutation.graphql";

export default async function submitQuoteRequest(payload: MutationsSubmitQuoteRequestArgs): Promise<QuoteType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "submitQuoteRequest">>,
    MutationsSubmitQuoteRequestArgs
  >({
    mutation: mutationDocument,
    variables: {
      ...payload,
    },
  });

  return data!.submitQuoteRequest;
}
