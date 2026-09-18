import { useMutation } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { CancelReturnDocument, OperationNames } from "@/modules/returns/api/graphql/types";

export function useCancelReturnMutation() {
  return useMutation(CancelReturnDocument, {
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    refetchQueries: [
      OperationNames.Query.GetReturns,
      OperationNames.Query.GetReturn,
      OperationNames.Query.GetReturnableItems,
    ],
  });
}
