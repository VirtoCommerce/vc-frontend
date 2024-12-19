import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ClearCartDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useClearCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { resolveClient } = useApolloClient();
  const result = useMutation(ClearCartDocument, useCartMutationVariables(cart));
  result.onDone(() => resolveClient().cache.gc());
  return result;
}

export function useClearCurrencyCartMutation() {
  const { storeId, cultureName } = globals;
  return useMutation(ClearCartDocument, {
    variables: {
      command: {
        storeId,
        cultureName,
      },
    },
  });
}

/** @deprecated Use {@link useClearCartMutation} instead. */
export async function clearCart(cartId: string): Promise<CartType> {
  const { mutate } = useClearCartMutation({ id: cartId });
  const result = await mutate();
  return result!.data!.clearCart as CartType;
}
