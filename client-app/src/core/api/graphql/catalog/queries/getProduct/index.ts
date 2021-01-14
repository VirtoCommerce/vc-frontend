import client from "@core/api/graphql/graphql-client";
import { Product } from '@core/api/graphql/types';
import { currencyCode, currentUserId, locale, storeId, catalogId, categoryId } from "@core/constants";
import getProductsQueryDocument from './getProductQuery.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getProduct(id: string): Promise<Product> {
  const { data } = await client.query({
    query: getProductsQueryDocument,
    variables: {
      storeId: storeId,
      currencyCode: currencyCode,
      id,
      cultureName: locale
    }
  });
  return data.product;
}
export default getProduct;
