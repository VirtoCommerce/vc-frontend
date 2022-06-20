import { Query, QueryCartArgs, ShippingMethodType } from "@/xapi/graphql/types";
import getAvailShippingMethodsDocument from "./getAvailShippingMethodsQuery.graphql";
import globals from "@/core/globals";

export default async function getAvailShippingMethods(): Promise<ShippingMethodType[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
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
