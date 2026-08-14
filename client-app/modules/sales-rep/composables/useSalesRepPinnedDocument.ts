import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepDocumentsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { mapSalesRepDocument } from "./useSalesRepDocuments";
import type { SalesRepDocumentType } from "../types";

// The library's pinned document (at most one is pinned) — the browse page's default featured
// document. `undefined` when nothing is pinned; the page then falls back to the newest document.
export function useSalesRepPinnedDocument() {
  const { result, loading, error, onError } = useQuery(
    SalesRepDocumentsDocument,
    { first: 1, pinned: true },
    { fetchPolicy: HUB_FETCH_POLICY },
  );

  onError((err) => {
    // No toast; a missing pinned document just leaves the newest-document fallback in place.
    Logger.error("[sales-rep] salesRepDocuments (pinned) failed:", err);
  });

  const document = computed<SalesRepDocumentType | undefined>(() => {
    const item = result.value?.salesRepDocuments?.items?.find((entry) => entry != null);
    return item ? mapSalesRepDocument(item) : undefined;
  });

  return { document, loading, error };
}
