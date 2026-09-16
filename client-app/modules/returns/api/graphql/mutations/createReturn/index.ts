import { useMutation } from "@vue/apollo-composable";
import { CreateReturnDocument, OperationNames } from "@/modules/returns/api/graphql/types";

export function useCreateReturnMutation() {
  return useMutation(CreateReturnDocument, {
    refetchQueries: [OperationNames.Query.GetReturns, OperationNames.Query.GetReturnableItems],
  });
}
