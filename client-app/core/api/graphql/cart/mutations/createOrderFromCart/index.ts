import client from "@core/api/graphql/graphql-client";
import { CustomerOrderType } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import mutationDocument from "./createOrderFromCartMutation.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createOrderFromCart(cartId?: string): Promise<CustomerOrderType> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId: cartId,
      },
    },
  });
  return data?.createOrderFromCart;
}
export default createOrderFromCart;
