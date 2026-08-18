import { computed, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepDocumentDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { mapSalesRepDocument } from "./useSalesRepDocuments";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepDocumentType } from "../types";
import type { Ref } from "vue";

// By-id lookup backing the browse page's `?doc=` deep link: the selected document usually sits in
// the loaded page (no request then — the caller keeps `enabled` off), but a shared link can point at
// a document on another page or behind another filter, and this fetches that one.
export function useSalesRepDocument(
  // Expanded union (not MaybeRefOrGetter<… | undefined>) — Sonar S4782.
  id: string | Ref<string | undefined> | (() => string | undefined),
  options: { enabled?: Ref<boolean> | (() => boolean) } = {},
) {
  const variables = computed(() => ({ id: toValue(id) ?? "" }));

  // Never queried without an id: the backend types `id` as non-null.
  const enabled = computed(() => Boolean(toValue(id)) && (toValue(options.enabled) ?? true));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepDocumentDocument, variables, {
    fetchPolicy: HUB_FETCH_POLICY,
    enabled,
  });

  onError((err) => {
    // No toast; the details panel shows its own error view instead (VCST-5586).
    Logger.error("[sales-rep] salesRepDocument failed:", err);
  });

  // `null` from the backend means "no such document (or not readable)" — mapped to undefined.
  const document = computed<SalesRepDocumentType | undefined>(() =>
    result.value?.salesRepDocument ? mapSalesRepDocument(result.value.salesRepDocument) : undefined,
  );

  return { document, loading, error };
}
