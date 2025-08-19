import { useMutation } from "@vue/apollo-composable";
import { MoveFromSavedForLaterDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export async function moveFromSavedForLater(cartId: string, lineItemIds: string[]) {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { mutate: _moveFromSavedForLater } = useMutation(MoveFromSavedForLaterDocument);

  const result = await _moveFromSavedForLater({
    command: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      cartId,
      lineItemIds,
    },
  });

  return result?.data?.moveFromSavedForLater;
}
