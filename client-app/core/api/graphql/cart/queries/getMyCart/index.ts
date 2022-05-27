import client from "@core/api/graphql/graphql-client";
import { CartType, Query, QueryCartArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getMyCartQueryDocument from "./getMyCartQuery.graphql";

export default async function getMyCart(): Promise<CartType> {
  const { data } = await client.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query: getMyCartQueryDocument,
    variables: {
      storeId,
      userId: currentUserId,
      currencyCode,
      cultureName: locale,
    },
  });

  return data.cart;
}
