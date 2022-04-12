import client from "@core/api/graphql/graphql-client";
import { Query, QueryCartArgs, ShippingMethodType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getAvailShippingMethodsDocument from "./getAvailShippingMethodsQuery.graphql";

export default async function getAvailShippingMethods(): Promise<ShippingMethodType[]> {
  const { data } = await client.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query: getAvailShippingMethodsDocument,
    variables: {
      storeId: storeId,
      userId: currentUserId,
      currencyCode: currencyCode,
      cultureName: locale,
    },
  });

  return data.cart.availableShippingMethods!;
}
