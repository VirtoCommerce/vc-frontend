import { computed, toValue } from "vue";
import { useMutation, useAllGlobalVariables } from "@/core/api/graphql/composables";
import { CreatePurchaseRequestFromDocumentsDocument } from "@/modules/purchase-requests/api/graphql/types";

export function useCreatePurchaseRequestFromDocumentsMutation() {
  return useMutation(
    CreatePurchaseRequestFromDocumentsDocument,
    computed(() => ({
      variables: {
        command: {
          ...toValue(useAllGlobalVariables()),
        },
      },
    })),
  );
}
