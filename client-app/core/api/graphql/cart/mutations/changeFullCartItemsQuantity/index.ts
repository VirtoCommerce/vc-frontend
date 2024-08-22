import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeFullCartItemsQuantityDocument } from "@/core/api/graphql/types";
import type { CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useChangeFullCartItemsQuantityMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(ChangeFullCartItemsQuantityDocument, useCartMutationVariables(cart));
}
