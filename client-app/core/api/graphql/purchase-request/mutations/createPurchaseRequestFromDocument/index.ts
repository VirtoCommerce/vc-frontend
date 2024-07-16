import { computed, toValue } from "vue";
import { useMutationVariables, useMutation, useAllGlobalVariables } from "@/core/api/graphql/composables";
import { CreatePurchaseRequestFromDocumentDocument } from "@/core/api/graphql/types";

export function useCreatePurchaseRequestFromDocumentMutation() {
  return useMutation(
    CreatePurchaseRequestFromDocumentDocument,
    useMutationVariables(
      computed(() => ({
        command: toValue(useAllGlobalVariables()),
      })),
    ),
  );
}
