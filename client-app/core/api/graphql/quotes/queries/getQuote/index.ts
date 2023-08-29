import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getQuoteQueryDocument from "./getQuoteQuery.graphql";
import type { Query, QueryQuoteArgs, QuoteType } from "@/core/api/graphql/types";

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
