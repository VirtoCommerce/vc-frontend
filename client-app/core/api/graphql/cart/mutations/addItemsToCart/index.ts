import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./addItemsToCartMutation.graphql";

export default async function addItemsToCart(cartItems: { productId: string; quantity: number }[]): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        cartItems: cartItems,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
