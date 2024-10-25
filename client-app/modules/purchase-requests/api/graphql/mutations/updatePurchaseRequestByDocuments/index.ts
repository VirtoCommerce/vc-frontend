import { computed, toValue } from "vue";
import { useMutation, useMutationVariables } from "@/core/api/graphql/composables";
import { UpdatePurchaseRequestByDocumentsDocument } from "@/modules/purchase-requests/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useUpdatePurchaseRequestByDocumentsMutation(
  variables: MaybeRefOrGetter<{ purchaseRequestId: string }>,
) {
  return useMutation(
    UpdatePurchaseRequestByDocumentsDocument,
    useMutationVariables(
      computed(() => ({
        command: toValue(variables),
      })),
    ),
  );
}
