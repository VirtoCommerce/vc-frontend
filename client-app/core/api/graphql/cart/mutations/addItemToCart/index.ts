import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./addItemToCartMutation.graphql";

export default async function addItemToCart(productId: string, qty: number): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        productId: productId,
        quantity: +qty,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
