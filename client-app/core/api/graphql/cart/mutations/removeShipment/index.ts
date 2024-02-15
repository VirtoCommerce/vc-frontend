import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { RemoveShipmentDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useRemoveShipmentMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { resolveClient } = useApolloClient();
  const result = useMutation(RemoveShipmentDocument, useCartMutationVariables(cart));
  result.onDone(() => resolveClient().cache.gc());
  return result;
}

/** @deprecated Use {@link useRemoveShipmentMutation} instead. */
export async function removeShipment(shipmentId: string, cartId?: string): Promise<CartType> {
  const { mutate } = useRemoveShipmentMutation(cartId ? { id: cartId } : undefined);

  const result = await mutate({
    command: {
      shipmentId,
    },
  });
  return result!.data!.removeShipment as CartType;
}
