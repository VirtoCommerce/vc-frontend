import { useMutation } from "@vue/apollo-composable";
import { DeleteSkyFlowCardDocument, OperationNames } from "../../types";

export function useDeleteSkyflowCard() {
  return useMutation(DeleteSkyFlowCardDocument, {
    refetchQueries: [OperationNames.Query.GetSkyflowCards],
  });
}
