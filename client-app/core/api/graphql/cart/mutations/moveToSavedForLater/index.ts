import { useMutation } from "@vue/apollo-composable";
import { MoveToSavedForLaterDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export async function moveToSavedForLater(cartId: string, lineItemIds: string[]) {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { mutate: _moveToSavedForLater } = useMutation(MoveToSavedForLaterDocument);

  const result = await _moveToSavedForLater({
    command: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      cartId,
      lineItemIds,
    },
  });

  return result?.data?.moveToSavedForLater;
}
