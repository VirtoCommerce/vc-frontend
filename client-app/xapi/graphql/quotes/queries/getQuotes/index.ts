import { Query, QueryQuotesArgs, QuoteConnection } from "@/xapi/types";
import getQuotesQueryDocument from "./getQuotesQuery.graphql";
import globals from "@/core/globals";

export default async function getQuotes(payload?: QueryQuotesArgs): Promise<QuoteConnection> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "quotes">>, QueryQuotesArgs>({
    query: getQuotesQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      ...payload,
    },
  });

  return data.quotes;
}
