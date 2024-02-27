import { computed, toValue } from "vue";
import { useAllGlobalVariables, useMutation } from "@/core/api/graphql/composables";
import { MergeCartDocument } from "./mergeCartMutation.generated";

export function useMergeCartMutation() {
  return useMutation(
    MergeCartDocument,
    computed(() => {
      const { storeId, cultureName, currencyCode } = toValue(useAllGlobalVariables());
      return {
        variables: {
          command: {
            storeId,
            cultureName,
            currencyCode,
          },
        },
      };
    }),
  );
}

/** @deprecated Use {@link useMergeCartMutation} instead. */
export async function mergeCart(userId: string, secondCartId: string, cartId?: string): Promise<void> {
  const { mutate } = useMergeCartMutation();
  await mutate({
    command: {
      userId,
      cartId,
      secondCartId,
    },
  });
}
