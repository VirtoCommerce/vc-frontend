import { useMutation } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { UpdateReturnDocument } from "@/modules/returns/api/graphql/types";

export function useUpdateReturnMutation() {
  return useMutation(UpdateReturnDocument, {
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });
}
