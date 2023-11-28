import { computed, unref } from "vue";
import { useAllGlobalVariables, useMutation } from "@/core/api/graphql/composables";
import { ChangeSelectedCartItemsDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useChangeSelectedCartItemsMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(
    ChangeSelectedCartItemsDocument,
    computed(() => {
      const variables = {
        ...useAllGlobalVariables(),
        cartId: unref(cart)?.id,
      };
      return {
        variables: {
          selectCartItemsCommand: variables,
          unselectCartItemsCommand: variables,
        },
      };
    }),
  );
}

/** @deprecated Use {@link useChangeSelectedCartItemsMutation} instead. */
export async function changeSelectedCartItems(
  selectedLineItemIds: string[],
  unselectedLineItemIds: string[],
): Promise<CartType> {
  const { mutate } = useChangeSelectedCartItemsMutation();
  const result = await mutate({
    selectCartItemsCommand: {
      lineItemIds: selectedLineItemIds,
    },
    unselectCartItemsCommand: {
      lineItemIds: unselectedLineItemIds,
    },
    withSelected: selectedLineItemIds.length > 0,
    withUnselected: unselectedLineItemIds.length > 0,
  });
  return (result!.data!.unSelectCartItems || result!.data!.selectCartItems)! as CartType;
}
