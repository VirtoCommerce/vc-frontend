import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import mutationDocument from "./changeSelectedCartItemsMutation.graphql";
import type {
  CartType,
  ChangeSelectedCartItemsMutation,
  ChangeSelectedCartItemsMutationVariables,
  InputChangeCartItemsSelectedType,
} from "@/core/api/graphql/types";

export async function changeSelectedCartItems(
  selectedLineItemIds: string[],
  unselectedLineItemIds: string[],
): Promise<CartType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const command: Omit<InputChangeCartItemsSelectedType, "lineItemIds"> = {
    storeId,
    userId,
    cultureName,
    currencyCode,
  };

  const { data } = await graphqlClient.mutate<
    ChangeSelectedCartItemsMutation,
    ChangeSelectedCartItemsMutationVariables
  >({
    mutation: mutationDocument,
    variables: {
      selectCartItemsCommand: {
        ...command,
        lineItemIds: selectedLineItemIds,
      },
      unselectCartItemsCommand: {
        ...command,
        lineItemIds: unselectedLineItemIds,
      },
      withSelected: selectedLineItemIds.length > 0,
      withUnselected: unselectedLineItemIds.length > 0,
    },
  });

  return (data!.unSelectCartItems || data!.selectCartItems)! as CartType;
}
