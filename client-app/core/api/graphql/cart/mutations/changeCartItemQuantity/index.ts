import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import changeFullCartItemQuantityMutation from "./changeFullCartItemQuantityMutation.graphql";
import changeShortCartItemQuantityMutation from "./changeShortCartItemQuantityMutation.graphql";
import type { CartType, Mutations, MutationsChangeCartItemQuantityArgs } from "@/core/api/graphql/types";

export type ChangeCartItemQuantityOptionsType = {
  /** @default false */
  reloadFullCart?: boolean;
};

export async function changeCartItemQuantity(
  lineItemId: string,
  quantity: number,
  options: ChangeCartItemQuantityOptionsType = {},
): Promise<CartType> {
  const { reloadFullCart = false } = options;
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "changeCartItemQuantity">>,
    MutationsChangeCartItemQuantityArgs
  >({
    mutation: reloadFullCart ? changeFullCartItemQuantityMutation : changeShortCartItemQuantityMutation,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        lineItemId,
        quantity,
      },
    },
  });

  return data!.changeCartItemQuantity;
}
