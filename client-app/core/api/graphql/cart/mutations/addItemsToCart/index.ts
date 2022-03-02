import { CartItemType } from "@/shared/cart";
import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./addItemsToCartMutation.graphql";

export default async function addItemsToCart(cartItems: CartItemType[]): Promise<void> {
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
