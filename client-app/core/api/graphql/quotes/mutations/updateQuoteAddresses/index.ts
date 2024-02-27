import { graphqlClient } from "../../../client";
import { UpdateQuoteAddressesDocument } from "./updateQuoteAddressesMutation.generated";
import type { Mutations, MutationsUpdateQuoteAddressesArgs, QuoteType } from "@/core/api/graphql/types";

export async function updateQuoteAddresses(payload: MutationsUpdateQuoteAddressesArgs): Promise<QuoteType> {
  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "updateQuoteAddresses">>,
    MutationsUpdateQuoteAddressesArgs
  >({
    mutation: UpdateQuoteAddressesDocument,
    variables: {
      ...payload,
    },
  });

  return data!.updateQuoteAddresses;
}
