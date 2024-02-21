import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangePurchaseOrderNumberDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useChangePurchaseOrderNumberMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(ChangePurchaseOrderNumberDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useChangePurchaseOrderNumberMutation} instead. */
export async function changePurchaseOrderNumber(purchaseOrderNumber: string): Promise<CartType> {
  const { mutate } = useChangePurchaseOrderNumberMutation();
  const result = await mutate({ command: { purchaseOrderNumber } });
  return result!.data!.changePurchaseOrderNumber as CartType;
}
