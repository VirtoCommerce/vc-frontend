import client from "@core/api/graphql/graphql-client";
import { Query, QueryCartArgs, ShippingMethodType } from "@core/api/graphql/types";
import getAvailShippingMethodsDocument from "./getAvailShippingMethodsQuery.graphql";
import globals from "@core/globals";

export default async function getAvailShippingMethods(): Promise<ShippingMethodType[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await client.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query: getAvailShippingMethodsDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
  });

  return data.cart.availableShippingMethods!;
}
