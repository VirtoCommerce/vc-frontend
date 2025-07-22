import { MoveFromSavedForLaterDocument  } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import type {CartWithListType} from "@/core/api/graphql/types";

export async function moveFromSavedForLater(cartId: string, lineItemIds: string[]) {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate({
    mutation: MoveFromSavedForLaterDocument,
    variables: {
      command: {
        storeId,
        userId,
        cultureName,
        currencyCode,
        cartId,
        lineItemIds,
      },
    },
  });

  return data!.moveFromSavedForLater as CartWithListType;
}
