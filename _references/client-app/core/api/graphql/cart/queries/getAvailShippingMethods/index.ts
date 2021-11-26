import client from "@core/api/graphql/graphql-client";
import { ShippingMethodType } from '@core/api/graphql/types';
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getAvailShippingMethodsDocument from './getAvailShippingMethodsQuery.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAvailShippingMethods(): Promise<ShippingMethodType[]> {
  const { data } = await client.query({
    query: getAvailShippingMethodsDocument,
    variables: {
      storeId: storeId,
      userId: currentUserId,
      currencyCode: currencyCode,
      cultureName: locale
    }
  });
  return data?.cart?.availableShippingMethods;
}
export default getAvailShippingMethods;
