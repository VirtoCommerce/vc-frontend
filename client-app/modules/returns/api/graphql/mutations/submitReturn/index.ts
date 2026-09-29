import { useMutation } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { OperationNames, SubmitReturnDocument } from "@/modules/returns/api/graphql/types";

export function useSubmitReturnMutation() {
  return useMutation(SubmitReturnDocument, {
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    refetchQueries: [
      OperationNames.Query.GetReturns,
      OperationNames.Query.GetReturn,
      OperationNames.Query.GetReturnableItems,
    ],
  });
}
