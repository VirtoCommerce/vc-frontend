import globals from "@/core/globals";
import getMyCartQueryDocument from "./getMyCartQuery.graphql";
import type { CartType, Query, QueryCartArgs } from "@/xapi/types";

export default async function getMyCart(): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
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
