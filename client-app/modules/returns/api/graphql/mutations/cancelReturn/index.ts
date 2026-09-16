import { useMutation } from "@vue/apollo-composable";
import { CancelReturnDocument, OperationNames } from "@/modules/returns/api/graphql/types";

export function useCancelReturnMutation() {
  return useMutation(CancelReturnDocument, {
    // The status changes and the held quantity goes back to available, so both the list and the
    // page the buyer is looking at would otherwise keep showing the return as still open.
    refetchQueries: [OperationNames.Query.GetReturns, OperationNames.Query.GetReturn],
  });
}
