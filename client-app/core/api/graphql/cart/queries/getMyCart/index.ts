import client from "@core/api/graphql/graphql-client";
import { CartType, Query, QueryCartArgs } from "@core/api/graphql/types";
import getMyCartQueryDocument from "./getMyCartQuery.graphql";
import globals from "@core/globals";

export default async function getMyCart(): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await client.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query: getMyCartQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
  });

  return data.cart;
}
