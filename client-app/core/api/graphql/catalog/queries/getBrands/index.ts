import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getBrandsQueryDocument from "./getBrandsQuery.graphql";
import type { BrandConnection, Query, QueryBrandsArgs } from "@/core/api/graphql/types";

export async function getBrands(payload?: { after?: string; first?: number }): Promise<BrandConnection> {
  const { storeId, currencyCode, userId, cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "brands">>, QueryBrandsArgs>({
    query: getBrandsQueryDocument,
    variables: {
      storeId,
      currencyCode,
      userId,
      cultureName,
      ...payload,
    },
  });

  return data.brands;
}
