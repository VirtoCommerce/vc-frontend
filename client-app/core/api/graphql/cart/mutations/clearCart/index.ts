import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ClearCartDocument } from "./clearCartMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { CartType } from "@/core/api/graphql/types/base.generated";
import type { MaybeRef } from "vue";

export function useClearCartMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { resolveClient } = useApolloClient();
  const result = useMutation(ClearCartDocument, useCartMutationVariables(cart));
  result.onDone(() => resolveClient().cache.gc());
  return result;
}

/** @deprecated Use {@link useClearCartMutation} instead. */
export async function clearCart(cartId: string): Promise<CartType> {
  const { mutate } = useClearCartMutation({ id: cartId });
  const result = await mutate();
  return result!.data!.clearCart as CartType;
}
