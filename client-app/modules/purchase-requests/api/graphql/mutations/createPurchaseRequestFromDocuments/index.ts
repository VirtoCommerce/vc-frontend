import { computed, toValue } from "vue";
import { useMutationVariables, useMutation, useAllGlobalVariables } from "@/core/api/graphql/composables";
import { CreatePurchaseRequestFromDocumentsDocument } from "@/modules/purchase-requests/api/graphql/types";

export function useCreatePurchaseRequestFromDocumentsMutation() {
  return useMutation(
    CreatePurchaseRequestFromDocumentsDocument,
    useMutationVariables(
      computed(() => ({
        command: toValue(useAllGlobalVariables()),
      })),
    ),
  );
}
