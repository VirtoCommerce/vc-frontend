import { Mutations, MutationsUpdateQuoteAddressesArgs, QuoteType } from "@/xapi/types";
import mutationDocument from "./updateQuoteAddressesMutation.graphql";

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
