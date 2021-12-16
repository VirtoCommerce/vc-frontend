import client from "@core/api/graphql/graphql-client";
import { currentUserId, storeId } from "@core/constants";
import mutationDocument from "./changeCartItemQuantityMutation.graphql";

async function changeCartItemQuantity(lineItemId: string, qty: number): Promise<void> {
  const { data } = await client.mutate({
    mutation: mutationDocument,
    variables: {
      command: {
        lineItemId: lineItemId,
        quantity: +qty,
        storeId: storeId,
        userId: currentUserId,
      },
    },
  });
}
export default changeCartItemQuantity;
