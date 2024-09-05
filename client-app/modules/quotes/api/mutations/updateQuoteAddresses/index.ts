import { graphqlClient } from "@/core/api/graphql/client";
import mutationDocument from "./updateQuoteAddressesMutation.graphql";
import type { Mutations, MutationsUpdateQuoteAddressesArgs, QuoteType } from "../../types";

export async function updateQuoteAddresses(payload: MutationsUpdateQuoteAddressesArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "updateQuoteAddresses">>,
    MutationsUpdateQuoteAddressesArgs
  >({
    mutation: mutationDocument,
    variables: {
      ...payload,
    },
  });

  return data!.updateQuoteAddresses;
}
