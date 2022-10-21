import { Query, QueryQuotesArgs, QuoteConnection } from "@/xapi/types";
import getQuotesQueryDocument from "./getQuotesQuery.graphql";
import globals from "@/core/globals";

export default async function getQuotes(payload?: QueryQuotesArgs): Promise<QuoteConnection> {
  const { userId } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "quotes">>, QueryQuotesArgs>({
    query: getQuotesQueryDocument,
    variables: {
      customerId: userId,
      ...payload,
    },
  });

  return data.quotes;
}
