import { Query, QueryQuoteArgs, QuoteType } from "@/xapi/types";
import getQuoteQueryDocument from "./getQuoteQuery.graphql";
import globals from "@/core/globals";

export default async function getQuote(payload?: QueryQuoteArgs): Promise<QuoteType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "quote">>, QueryQuoteArgs>({
    query: getQuoteQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      ...payload,
    },
  });

  return data.quote;
}
