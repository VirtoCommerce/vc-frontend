import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetQuoteDocument } from "./getQuoteQuery.generated";
import type { Query, QueryQuoteArgs, QuoteType } from "@/core/api/graphql/types";

export async function getQuote(payload?: QueryQuoteArgs): Promise<QuoteType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "quote">>, QueryQuoteArgs>({
    query: GetQuoteDocument,
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
