import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import getQuoteQueryDocument from "./getQuoteQuery.graphql";
import type { Query, QueryQuoteArgs, QuoteType } from "../../types";

export async function getQuote(payload?: QueryQuoteArgs): Promise<QuoteType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "quote">>, QueryQuoteArgs>({
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
