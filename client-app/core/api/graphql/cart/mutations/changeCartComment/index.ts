import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeCartCommentDocument } from "@/core/api/graphql/types";
import type { CartIdFragment, CartType } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useChangeCartCommentMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  return useMutation(ChangeCartCommentDocument, useCartMutationVariables(cart));
}

/** @deprecated Use {@link useChangeCartCommentMutation} instead. */
export async function changeCartComment(comment: string): Promise<CartType> {
  const { mutate } = useChangeCartCommentMutation();
  const result = await mutate({ command: { comment } });
  return result!.data!.changeComment as CartType;
}
