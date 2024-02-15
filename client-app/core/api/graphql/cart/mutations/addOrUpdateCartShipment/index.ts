import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { AddOrUpdateCartShipmentDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType, InputShipmentType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useAddOrUpdateCartShipmentMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { resolveClient } = useApolloClient();
  const result = useMutation(AddOrUpdateCartShipmentDocument, useCartMutationVariables(cart));
  result.onDone(() => resolveClient().cache.gc());
  return result;
}

/** @deprecated Use {@link useAddOrUpdateCartShipmentMutation} instead. */
export async function addOrUpdateCartShipment(shipment: InputShipmentType, cartId?: string): Promise<CartType> {
  const { mutate } = useAddOrUpdateCartShipmentMutation(
    cartId
      ? {
          id: cartId,
        }
      : undefined,
  );
  const result = await mutate({
    command: {
      shipment,
    },
  });
  return result!.data!.addOrUpdateCartShipment as CartType;
}
