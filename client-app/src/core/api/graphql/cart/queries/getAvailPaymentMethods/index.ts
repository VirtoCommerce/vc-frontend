import client from "@core/api/graphql/graphql-client";
import { PaymentMethodType } from '@core/api/graphql/types';
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getAvailPaymentMethodsDocument from './getAvailPaymentMethodsQuery.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAvailPaymentMethods(): Promise<PaymentMethodType[]> {

  const { data } = await client.query({
    query: getAvailPaymentMethodsDocument,
    variables: {
      storeId: storeId,
      userId: currentUserId,
      currencyCode: currencyCode,
      cultureName: locale
    }
  });
  return data?.cart?.availablePaymentMethods;
}
export default getAvailPaymentMethods;
