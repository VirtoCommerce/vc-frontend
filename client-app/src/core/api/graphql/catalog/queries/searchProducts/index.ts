import client from "@core/api/graphql/graphql-client";
import { ProductConnection } from '@core/api/graphql/types';
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import searchProductsQueryDocument from './searchProductsQuery.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function searchProducts(itemsPerPage: number, page: number): Promise<ProductConnection> {

  const { data } = await client.query({
    query: searchProductsQueryDocument,
    variables: {
      storeId: storeId,
      userId: currentUserId,
      currencyCode: currencyCode,
      cultureName: locale,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage)
    }
  });
  return data.products;
}
export default searchProducts;
