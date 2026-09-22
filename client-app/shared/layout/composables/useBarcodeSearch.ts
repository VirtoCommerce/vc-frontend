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
import { ROUTES } from "@/router/routes/constants";
import type { RouteLocationRaw } from "vue-router";

/**
 * The search results route a scanned code navigates to in exact match mode. The code travels as its own
 * query param (not as `q`), so the results page can turn it into the `barcode` filter term.
 */
export function getBarcodeSearchRoute(value: string): RouteLocationRaw {
  return { name: ROUTES.SEARCH.NAME, query: { [QueryParamName.Barcode]: value } };
}

/**
 * D4: a scanned code identifies one product, so a single hit opens it instead of a one-item list.
 * The decision is taken on the state captured when the request was issued, so a response for a code the
 * URL has moved on from, a result narrowed by facets/paging/sorting, or a second completion for the same
 * code cannot navigate.
 */
export function shouldOpenSingleBarcodeHit(request: {
  /** The code the completed request was issued for. */
  requestedBarcode: string;
  /** The code the URL holds now. */
  currentBarcode: string;
  /** Whether the request carried facet/page/sort params. */
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

/** The setting arrives as a JSON string; anything else (missing, malformed) means "no fields configured". */
function parseBarcodeSearchFields(rawValue: unknown): string[] {
  if (typeof rawValue !== "string" || !rawValue) {
    return [];
  }

  try {
    const fields = JSON.parse(rawValue) as unknown;

    if (Array.isArray(fields) && fields.every((field) => typeof field === "string")) {
      return fields;
    }
  } catch {
    // fall through: an unreadable value must not switch the scanner to exact match
  }

  return [];
}

/**
 * Store-level barcode scanner configuration, shared by the desktop and mobile search bars.
 * A backend without the settings keeps today's behaviour: the scanner is shown and a scanned code is
 * searched as a full-text phrase.
 */
export function useBarcodeSearch(options: {
  /** Today's behaviour: put the code in the input and run a keyword search. */
  searchFullText: (value: string) => void;
  /** What the bar binds to the dropdown's `hide` event — the exact path navigates without the dropdown. */
  hideSearchResults: () => void;
}) {
  const router = useRouter();
  const { analytics } = useAnalytics();
  const { getSettingValue } = useModuleSettings(MODULE_ID_CATALOG);

  const isScannerEnabled = computed(() => getSettingValue(CATALOG_BARCODE_SCANNER_ENABLED_KEY) !== false);

  const isExactMatch = computed(
    () => parseBarcodeSearchFields(getSettingValue(CATALOG_BARCODE_SEARCH_FIELDS_KEY)).length > 0,
  );

  function onBarcodeScanned(value: string): void {
    if (!value) {
      return;
    }

    if (isExactMatch.value) {
      // Parity with the full-text path's `search` event. By design the code is NOT saved to the search
      // history (it is not a keyword) and the lookup stays global (no category scope).
      analytics("search", value);
      options.hideSearchResults();
      void router.push(getBarcodeSearchRoute(value));
      return;
    }

    options.searchFullText(value);
  }

  return {
    isScannerEnabled,
    onBarcodeScanned,
  };
}
