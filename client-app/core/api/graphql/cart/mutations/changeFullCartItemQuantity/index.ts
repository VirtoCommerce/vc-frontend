import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeFullCartItemQuantityDocument } from "./changeFullCartItemQuantityMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { MaybeRef } from "vue";

export function useChangeFullCartItemQuantityMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(ChangeFullCartItemQuantityDocument, useCartMutationVariables(cart));
}
