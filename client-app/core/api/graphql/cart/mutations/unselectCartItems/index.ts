import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { UnselectCartItemsDocument } from "./unselectCartItemsMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { MaybeRef } from "vue";

export function useUnselectCartItemsMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(UnselectCartItemsDocument, useCartMutationVariables(cart));
}
