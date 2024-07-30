import { computed } from "vue";
import { useGetPurchaseRequestQuery } from "@/core/api/graphql/purchase-request/queries/getPurchaseRequest";
import { toAttachedFile } from "@/ui-kit/utilities/file";
import type { MaybeRefOrGetter } from "vue";

export function usePurchaseRequest(variables: MaybeRefOrGetter<{ id: string }>) {
  const { result, refetch } = useGetPurchaseRequestQuery(variables);

  const purchaseRequest = computed(() => result?.value?.purchaseRequest);

  const sources = computed(() => purchaseRequest.value?.sources ?? []);

  const sourceFiles = computed(() =>
    sources.value.map((source) => toAttachedFile(source.name, source.size, source.contentType, source.url)),
  );

  return {
    purchaseRequest,
    sources,
    sourceFiles,
    refetch,
  };
}
