import client from "@core/api/graphql/graphql-client";
import { ProductAssociation } from '@core/api/graphql/types';
import { currencyCode, currentUserId, locale, storeId, catalogId, categoryId } from "@core/constants";
import searchRelatedProductsQueryDocument from './searchRelatedProducts.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function searchRelatedProducts(id: string): Promise<ProductAssociation[]> {
  const { data } = await client.query({
    query: searchRelatedProductsQueryDocument,
    variables: {
      storeId: storeId,
      currencyCode: currencyCode,
      id,
      cultureName: locale
    }
  });
  return data?.product?.associations?.items;
}
export default searchRelatedProducts;
