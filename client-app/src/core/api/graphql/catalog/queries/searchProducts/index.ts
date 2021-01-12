import client from "@core/api/graphql/graphql-client";
import { ProductConnection } from '@core/api/graphql/types';
import { currencyCode, currentUserId, locale, storeId, catalogId, categoryId as categoryIdFromRoute } from "@core/constants";
import searchProductsQueryDocument from './searchProductsQuery.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function searchProducts({ itemsPerPage = 20, page = 1, categoryId = categoryIdFromRoute, sort = ''}): Promise<ProductConnection> {
  const { data } = await client.query({
    query: searchProductsQueryDocument,
    variables: {
      storeId: storeId,
      sort,
      userId: currentUserId,
      currencyCode: currencyCode,
      filter:  categoryId ? `category.subtree:${catalogId}/${categoryId}` : '',
      cultureName: locale,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage)
    }
  });
  return data.products;
}
export default searchProducts;
