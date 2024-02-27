import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { AddOrUpdateCartPaymentDocument } from "./addOrUpdateCartPaymentMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { CartType, InputPaymentType } from "@/core/api/graphql/types/base.generated";
import type { MaybeRef } from "vue";

export function useAddOrUpdateCartPaymentMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { resolveClient } = useApolloClient();
  const result = useMutation(AddOrUpdateCartPaymentDocument, useCartMutationVariables(cart));
  result.onDone(() => resolveClient().cache.gc());
  return result;
}

/** @deprecated Use {@link useAddOrUpdateCartPaymentMutation} instead. */
export async function addOrUpdateCartPayment(payment: InputPaymentType, cartId?: string): Promise<CartType> {
  const { mutate } = useAddOrUpdateCartPaymentMutation(
    cartId
      ? {
          id: cartId,
        }
      : undefined,
  );
  const result = await mutate({
    command: {
      payment,
    },
  });
  return result!.data!.addOrUpdateCartPayment as CartType;
}
