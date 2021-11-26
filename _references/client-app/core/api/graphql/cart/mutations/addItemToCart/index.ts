import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from './addItemToCartMutation.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addItemToCart(productId: string, qty: number): Promise<void> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        productId: productId,
        quantity: qty,
        storeId: storeId,
        userId: currentUserId
      }
    }
  });
}
export default addItemToCart;
