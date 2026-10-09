import { graphqlClient } from "@/core/api/graphql/client";
import { GetSavedForLaterDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export async function getSavedForLater() {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query({
    query: GetSavedForLaterDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
  });

  return data?.getSavedForLater;
}
