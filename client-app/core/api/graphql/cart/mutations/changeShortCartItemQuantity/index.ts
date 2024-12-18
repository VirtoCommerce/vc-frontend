import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeShortCartItemQuantityDocument } from "@/core/api/graphql/types";
import type { CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useChangeShortCartItemQuantityMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(ChangeShortCartItemQuantityDocument, useCartMutationVariables(cart, {}));
}
