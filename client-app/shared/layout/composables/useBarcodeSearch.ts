import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAnalytics } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import {
  CATALOG_BARCODE_SCANNER_ENABLED_KEY,
  CATALOG_BARCODE_SEARCH_FIELDS_KEY,
  MODULE_ID_CATALOG,
} from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { parseJsonStringArray } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import type { Ref } from "vue";
import type { RouteLocationRaw } from "vue-router";

/**
 * The search results route a scanned code navigates to in exact match mode. The code travels as its own
 * query param (not as `q`), so the results page can turn it into the `barcode` filter term.
 */
function getBarcodeSearchRoute(value: string): RouteLocationRaw {
  return { name: ROUTES.SEARCH.NAME, query: { [QueryParamName.Barcode]: value } };
}

/** The setting holds a JSON array of index fields; an unreadable one must not switch to exact match. */
function hasBarcodeSearchFields(rawValue: unknown): boolean {
  return !!parseJsonStringArray(rawValue)?.length;
}

/**
 * D4: a scanned code identifies one product, so a single hit opens it instead of a one-item list.
 * The decision is taken on the state captured when the request was issued, so a response for a code the
 * URL has moved on from, a result narrowed by facets/paging/sorting, or a second completion for the same
 * code cannot navigate.
 */
export function shouldOpenSingleBarcodeHit(request: {
  requestedBarcode: string;
  currentBarcode: string;
  wasNarrowed: boolean;
  redirectedBarcodes: ReadonlySet<string>;
  totalCount: number;
  itemCount: number;
}): boolean {
  const { requestedBarcode, currentBarcode, wasNarrowed, redirectedBarcodes, totalCount, itemCount } = request;

  return (
    !!requestedBarcode &&
    requestedBarcode === currentBarcode &&
    !wasNarrowed &&
    !redirectedBarcodes.has(requestedBarcode) &&
    totalCount === 1 &&
    itemCount === 1
  );
}

/**
 * Store-level barcode scanner configuration, shared by the desktop and mobile search bars.
 * A backend without the settings keeps today's behaviour: the scanner is shown and a scanned code is
 * searched as a full-text phrase.
 */
export function useBarcodeSearch(options: {
  /** The bar's input model — today's behaviour puts the code in it and runs a keyword search. */
  searchPhrase: Ref<string>;
  searchDropdownRef: Readonly<Ref<{ handleSearch: () => void } | null>>;
  /** What the bar binds to the dropdown's `hide` event — the exact path navigates without the dropdown. */
  hideSearchResults: () => void;
}) {
  const router = useRouter();
  const { analytics } = useAnalytics();
  const { getSettingValue } = useModuleSettings(MODULE_ID_CATALOG);

  const isScannerEnabled = computed(() => getSettingValue(CATALOG_BARCODE_SCANNER_ENABLED_KEY) !== false);

  function onBarcodeScanned(value: string): void {
    if (!value) {
      return;
    }

    if (hasBarcodeSearchFields(getSettingValue(CATALOG_BARCODE_SEARCH_FIELDS_KEY))) {
      // Parity with the full-text path's `search` event. By design the code is NOT saved to the search
      // history (it is not a keyword) and the lookup stays global (no category scope).
      analytics("search", value);
      options.hideSearchResults();
      void router.push(getBarcodeSearchRoute(value));
      return;
    }

    options.searchPhrase.value = value;
    options.searchDropdownRef.value?.handleSearch();
  }

  return {
    isScannerEnabled,
    onBarcodeScanned,
  };
}
