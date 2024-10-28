import { computed, toValue } from "vue";
import { useAllGlobalVariables } from "@/core/api/graphql/composables";
import { useUpdatePurchaseRequestByDocumentsMutation } from "@/modules/purchase-requests/api/graphql/mutations/updatePurchaseRequestByDocuments";
import { useGetPurchaseRequestQuery } from "@/modules/purchase-requests/api/graphql/queries/getPurchaseRequest";
import { useUserQuote } from "@/modules/quotes/useUserQuote";
import { useFullCart } from "@/shared/cart";
import { toAttachedFile } from "@/ui-kit/utilities/file";
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

  const { mutate: _updatePurchaseRequestByDocuments } = useUpdatePurchaseRequestByDocumentsMutation(variables);

  async function updatePurchaseRequestByDocuments(items: INewFile[]): Promise<void> {
    return await processDocuments(items, async (documentUrls) => {
      await _updatePurchaseRequestByDocuments({ command: { documentUrls } });
    });
  }

  const {
    loading: cartLoading,
    cart,
    allItemsAreDigital: allCartItemsAreDigital,
    forceFetch: fetchCart,
    changeItemQuantityBatched: _changeCartItemQuantity,
    removeItems: _removeCartItems,
  } = useFullCart();
  const {
    fetching: quoteLoading,
    quote,
    fetchQuote,
    changeItemQuantity: _changeQuoteItemQuantity,
    removeItem: _removeQuoteItem,
  } = useUserQuote();

  async function fetchItems() {
    if (purchaseRequest.value?.cartId) {
      await fetchCart({ cartId: purchaseRequest.value.cartId });
    }
    if (purchaseRequest.value?.quoteId) {
      await fetchQuote({ id: purchaseRequest.value.quoteId, ...toValue(useAllGlobalVariables()) });
    }
  }

  async function changeCartItemQuantity(value: { itemId: string; quantity: number }) {
    await _changeCartItemQuantity(value.itemId, value.quantity);
    await fetchItems();
  }

  async function changeQuoteItemQuantity(value: { itemId: string; quantity: number }) {
    await _changeQuoteItemQuantity(purchaseRequest.value!.quoteId!, value.itemId, value.quantity);
    await fetchItems();
  }

  async function removeCartItems(itemIds: string[]) {
    await _removeCartItems(itemIds);
    await fetchItems();
  }

  async function removeQuoteItem(itemId: string) {
    await _removeQuoteItem(purchaseRequest.value!.quoteId!, itemId);
    await fetchItems();
  }

  return {
    loading: computed(() => purchaseRequestLoading.value || cartLoading.value || quoteLoading.value),
    changing,
    purchaseRequest,
    sources,
    sourceFiles,
    files,
    fileOptions,
    cart,
    allCartItemsAreDigital,
    quote,
    refetch,
    fetchFileOptions,
    updatePurchaseRequestByDocuments,
    fetchItems,
    changeCartItemQuantity,
    changeQuoteItemQuantity,
    removeCartItems,
    removeQuoteItem,
  };
}
