import { useMutation } from "@/core/api/graphql/composables";
import { DeleteSkyFlowCardDocument, OperationNames } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useDeleteSkyflowCardMutation() {
  const { storeId } = globals;

  return useMutation(DeleteSkyFlowCardDocument, {
    variables: { command: { storeId } },
    refetchQueries: [OperationNames.Query.GetSkyflowCards],
  });
}
