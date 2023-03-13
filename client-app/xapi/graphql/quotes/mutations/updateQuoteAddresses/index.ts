import mutationDocument from "./updateQuoteAddressesMutation.graphql";
import type { Mutations, MutationsUpdateQuoteAddressesArgs, QuoteType } from "@/xapi/types";

export default async function removeQuoteItem(payload: MutationsUpdateQuoteAddressesArgs): Promise<QuoteType> {
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
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
