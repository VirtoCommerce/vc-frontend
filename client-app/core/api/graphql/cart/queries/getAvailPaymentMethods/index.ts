import client from "@core/api/graphql/graphql-client";
import { PaymentMethodType, Query, QueryCartArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getAvailPaymentMethodsDocument from "./getAvailPaymentMethodsQuery.graphql";

export default async function getAvailPaymentMethods(): Promise<PaymentMethodType[]> {
  const { data } = await client.query<Required<Pick<Query, "cart">>, QueryCartArgs>({
    query: getAvailPaymentMethodsDocument,
    variables: {
      storeId,
      userId: currentUserId,
      currencyCode,
      cultureName: locale,
    },
  });

  return data.cart.availablePaymentMethods!;
}
