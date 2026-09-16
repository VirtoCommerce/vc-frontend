import { useMutation } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { CreateReturnDocument, OperationNames } from "@/modules/returns/api/graphql/types";

export function useCreateReturnMutation() {
  return useMutation(CreateReturnDocument, {
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    refetchQueries: [OperationNames.Query.GetReturns, OperationNames.Query.GetReturnableItems],
  });
}
