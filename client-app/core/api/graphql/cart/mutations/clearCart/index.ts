import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./clearCartMutation.graphql";
import type { CartType, ClearCartMutation, MutationsClearCartArgs } from "@/core/api/graphql/types";

export async function clearCart(cartId: string): Promise<CartType> {
  const { storeId, userId } = globals;

  const { data } = await graphqlClient.mutate<ClearCartMutation, MutationsClearCartArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        cartId,
        storeId,
        userId,
      },
    },
  });

  return data!.clearCart as CartType;
}
