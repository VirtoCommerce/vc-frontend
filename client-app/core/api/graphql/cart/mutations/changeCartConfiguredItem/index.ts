import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeCartConfiguredItemDocument } from "@/core/api/graphql/types";
import type { CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useChangeCartConfiguredItemMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(ChangeCartConfiguredItemDocument, useCartMutationVariables(cart));
}
