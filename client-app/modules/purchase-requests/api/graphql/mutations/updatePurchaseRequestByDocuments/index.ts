import { computed, toValue } from "vue";
import { useMutation } from "@/core/api/graphql/composables";
import { UpdatePurchaseRequestByDocumentsDocument } from "@/modules/purchase-requests/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useUpdatePurchaseRequestByDocumentsMutation(
  variables: MaybeRefOrGetter<{ purchaseRequestId: string }>,
) {
  return useMutation(
    UpdatePurchaseRequestByDocumentsDocument,
    computed(() => ({
      variables: {
        command: {
          ...toValue(variables),
        },
      },
    })),
  );
}
