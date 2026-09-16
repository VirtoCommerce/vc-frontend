import { useMutation } from "@vue/apollo-composable";
import { CancelReturnDocument, OperationNames } from "@/modules/returns/api/graphql/types";

export function useCancelReturnMutation() {
  return useMutation(CancelReturnDocument, {
    refetchQueries: [
      OperationNames.Query.GetReturns,
      OperationNames.Query.GetReturn,
      OperationNames.Query.GetReturnableItems,
    ],
  });
}
