import { graphqlClient } from "@/core/api/graphql/client";
import {  GetSavedForLaterDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type {CartType} from "@/core/api/graphql/types";

export type RecentlyBrowsedParamsType = {
  maxProducts?: number;
};

export async function getSavedForLater(): Promise<CartType | undefined> {
  const { storeId, userId, organizationId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query({
    query: GetSavedForLaterDocument,
    variables: {
      storeId,
      userId,
      organizationId,
      cultureName,
      currencyCode,
    },
  });

  return data?.getSavedForLater as CartType | undefined;
}
