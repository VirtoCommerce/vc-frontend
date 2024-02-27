import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeCartCommentDocument } from "./changeCartCommentMutation.generated";
import type { CartIdFragment } from "@/core/api/graphql/cart/fragments/cartId.generated";
import type { CartType } from "@/core/api/graphql/types/base.generated";
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
