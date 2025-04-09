import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getProductsQueryDocument from "./getProductQuery.graphql";
import type { GetProductQuery, GetProductQueryVariables, Product } from "@/core/api/graphql/types";

export async function getProduct(id: string, previousOutline: string): Promise<Product | undefined> {
  const { storeId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<GetProductQuery, GetProductQueryVariables>({
    query: getProductsQueryDocument,
    variables: {
      storeId,
      cultureName,
      currencyCode,
      id,
      previousOutline
    },
  });

  return data.product as Product | undefined;
}
