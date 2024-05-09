import { useMutation } from "@/core/api/graphql/composables";
import { ConfirmEmailDocument } from "@/core/api/graphql/types";

export function useConfirmEmailMutation() {
  return useMutation(ConfirmEmailDocument);
}
