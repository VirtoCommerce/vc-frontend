import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import createQuoteDocument from "./createQuote.graphql";
import type { CreateQuoteMutation, CreateQuoteMutationVariables } from "@/core/api/graphql/types";

export async function createQuote(): Promise<CreateQuoteMutation["createQuote"]> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<CreateQuoteMutation, CreateQuoteMutationVariables>({
    mutation: createQuoteDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
      },
    },
  });

  return data?.createQuote;
}
