import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./removeCartItemMutation.graphql";

export default async function removeCartItem(lineItemId: string): Promise<void> {
  await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        lineItemId: lineItemId,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
