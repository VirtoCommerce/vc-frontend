import client from "@core/api/graphql/graphql-client";
import { PaymentMethodType, Query, QueryCartArgs } from "@core/api/graphql/types";
import getAvailPaymentMethodsDocument from "./getAvailPaymentMethodsQuery.graphql";
import globals from "@core/globals";

export default async function getAvailPaymentMethods(): Promise<PaymentMethodType[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await client.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
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
