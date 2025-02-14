import { useMutation } from "@vue/apollo-composable";
import { computed, toValue, watch } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { useGetPurchaseRequestQuery } from "@/modules/purchase-requests/api/graphql/queries/getPurchaseRequest";
import { useUserQuote } from "@/modules/quotes/useUserQuote";
import { toAttachedFile } from "@/ui-kit/utilities/file";
import { UpdatePurchaseRequestByDocumentsDocument } from "../api/graphql/types";
import { usePurchaseRequestDocuments } from "./usePurchaseRequestDocuments";
import type { MaybeRefOrGetter } from "vue";

export function usePurchaseRequest(variables: MaybeRefOrGetter<{ purchaseRequestId: string }>) {
  const { result: query, refetch, loading: purchaseRequestLoading } = useGetPurchaseRequestQuery(variables);

  const purchaseRequest = computed(() => query?.value?.purchaseRequest);

  const sources = computed(() => purchaseRequest.value?.sources ?? []);

  const sourceFiles = computed(() =>
    sources.value.map((source) => toAttachedFile(source.name, source.size, source.contentType, source.url)),
  );

  const {
    files,
    fetchFileOptions,
    fileOptions,
    processing: changing,
    processDocuments,
  } = usePurchaseRequestDocuments(sourceFiles);

  const { mutate: _updatePurchaseRequestByDocuments } = useMutation(UpdatePurchaseRequestByDocumentsDocument);

  async function updatePurchaseRequestByDocuments(items: INewFile[]): Promise<void> {
    return await processDocuments(items, async (documentUrls) => {
      await _updatePurchaseRequestByDocuments({
        command: { documentUrls, ...toValue(variables) },
      });
    });
  }

  const {
    fetching: quoteLoading,
    quote,
    fetchQuote,
    changeItemQuantity: _changeQuoteItemQuantity,
    removeItem: _removeQuoteItem,
  } = useUserQuote();

  async function fetchItems() {
    if (purchaseRequest.value?.quoteId) {
      await fetchQuote({ id: purchaseRequest.value.quoteId, ...toValue(useAllGlobalVariables()) });
    }
  }

  async function changeQuoteItemQuantity(value: { itemId: string; quantity: number }) {
    await _changeQuoteItemQuantity(purchaseRequest.value!.quoteId!, value.itemId, value.quantity);
    await fetchItems();
  }

  async function removeQuoteItem(itemId: string) {
    await _removeQuoteItem(purchaseRequest.value!.quoteId!, itemId);
    await fetchItems();
  }

  watch(
    purchaseRequest,
    async () => {
      await fetchItems();
    },
    { immediate: true },
  );

  return {
    loading: computed(() => purchaseRequestLoading.value || quoteLoading.value),
    changing,
    purchaseRequest,
    sources,
    sourceFiles,
    files,
    fileOptions,
    quote,
    refetch,
    fetchFileOptions,
    updatePurchaseRequestByDocuments,
    fetchItems,
    changeQuoteItemQuantity,
    removeQuoteItem,
  };
}
