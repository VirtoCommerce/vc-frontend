import client from "@core/api/graphql/graphql-client";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from './removeCartMutation.graphql';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function removeCart(cartId?: string): Promise<void> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId: cartId
      }
    }
  });
}
export default removeCart;
