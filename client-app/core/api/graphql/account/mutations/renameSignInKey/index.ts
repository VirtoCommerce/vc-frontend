import { useMutation } from "@vue/apollo-composable";
import { OperationNames, RenameSignInKeyDocument } from "@/core/api/graphql/types";

export function useRenameSignInKeyMutation() {
  return useMutation(RenameSignInKeyDocument, {
    refetchQueries: [OperationNames.Query.GetSignInMethods],
  });
}
