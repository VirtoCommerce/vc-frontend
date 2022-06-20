import { PaymentMethodType, Query, QueryCartArgs } from "@/xapi/graphql/types";
import getAvailPaymentMethodsDocument from "./getAvailPaymentMethodsQuery.graphql";
import globals from "@/core/globals";

export default async function getAvailPaymentMethods(): Promise<PaymentMethodType[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query: getAvailPaymentMethodsDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
  });

  return data.cart.availablePaymentMethods!;
}
