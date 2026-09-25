import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { shouldOpenSingleBarcodeHit, takeUnreportedScan, useBarcodeSearch } from "./useBarcodeSearch";

const { routerPush, settingValues } = vi.hoisted(() => ({
  routerPush: vi.fn(() => Promise.resolve<unknown>(undefined)),
  settingValues: new Map<string, unknown>(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: (name: string) => settingValues.get(name) }),
}));

const ENABLED_KEY = "Catalog.Search.BarcodeScannerEnabled";
const FIELDS_KEY = "Catalog.Search.BarcodeSearchFields";

const searchPhrase = ref("");
const handleSearch = vi.fn();
const searchDropdownRef = ref<{ handleSearch: () => void } | null>({ handleSearch });
const hideSearchResults = vi.fn();

function createComposable() {
  return useBarcodeSearch({ searchPhrase, searchDropdownRef, hideSearchResults });
}

beforeEach(() => {
  settingValues.clear();
  searchPhrase.value = "";
  routerPush.mockClear();
  handleSearch.mockClear();
  hideSearchResults.mockClear();
});

// The single-hit redirect is a navigation side effect taken after an awaited request, so every guard is
// decided on the state captured when that request was issued.
describe("shouldOpenSingleBarcodeHit", () => {
  const singleHit = {
    requestedBarcode: "150701",
    currentBarcode: "150701",
    wasNarrowed: false,
    redirectedBarcodes: new Set<string>(),
    totalCount: 1,
    itemCount: 1,
  };

  it("opens the product when the request's code is still the current one and it matched exactly one", () => {
    expect(shouldOpenSingleBarcodeHit(singleHit)).toBe(true);
  });

  it("does not open when there is no code", () => {
    expect(shouldOpenSingleBarcodeHit({ ...singleHit, requestedBarcode: "", currentBarcode: "" })).toBe(false);
  });

  // A slower response for a code the URL has already moved on from.
  it("does not open when the request's code is no longer the current one", () => {
    expect(shouldOpenSingleBarcodeHit({ ...singleHit, currentBarcode: "150702" })).toBe(false);
  });

  it("does not open twice for the same code", () => {
    expect(shouldOpenSingleBarcodeHit({ ...singleHit, redirectedBarcodes: new Set(["150701"]) })).toBe(false);
  });

  // The one hit came from facets/paging/sorting, not from the code alone.
  it("does not open when the request was narrowed", () => {
    expect(shouldOpenSingleBarcodeHit({ ...singleHit, wasNarrowed: true })).toBe(false);
  });

  it("does not open when the code matched several products", () => {
    expect(shouldOpenSingleBarcodeHit({ ...singleHit, totalCount: 2, itemCount: 2 })).toBe(false);
  });

  // A page of one out of many is not a single hit either.
  it("does not open when only the shown page holds one product", () => {
    expect(shouldOpenSingleBarcodeHit({ ...singleHit, totalCount: 17 })).toBe(false);
  });

  // The total is already 1 while the previous result is still on screen.
  it("does not open before the matching product is in hand", () => {
    expect(shouldOpenSingleBarcodeHit({ ...singleHit, itemCount: 0 })).toBe(false);
  });
});

describe("useBarcodeSearch", () => {
  describe("isScannerEnabled", () => {
    // A backend without the setting (old platform) must keep the scanner visible.
    it("is enabled when the setting is missing", () => {
      expect(createComposable().isScannerEnabled.value).toBe(true);
    });

    it("is enabled when the setting is true", () => {
      settingValues.set(ENABLED_KEY, true);

      expect(createComposable().isScannerEnabled.value).toBe(true);
    });

    it("is disabled only when the setting is explicitly false", () => {
      settingValues.set(ENABLED_KEY, false);

      expect(createComposable().isScannerEnabled.value).toBe(false);
    });
  });

  // The mode is not exposed; it is observable only through what a scan does.
  describe("match mode from the fields setting", () => {
    function scan() {
      createComposable().onBarcodeScanned("4006381333931");
    }

    it.each([
      ["missing", undefined],
      ["not a readable field list", "[gtin"],
    ])("searches the code as a phrase when the setting is %s", (_case, value) => {
      if (value !== undefined) {
        settingValues.set(FIELDS_KEY, value);
      }

      scan();

      expect(searchPhrase.value).toBe("4006381333931");
      expect(handleSearch).toHaveBeenCalledOnce();
      expect(routerPush).not.toHaveBeenCalled();
    });

    it.each([
      ["one field", '["gtin"]'],
      ["several fields", '["gtin","code","manufacturerPartNumber"]'],
    ])("navigates to the barcode results when the setting holds %s", (_case, value) => {
      settingValues.set(FIELDS_KEY, value);

      scan();

      expect(routerPush).toHaveBeenCalledWith({ name: "Search", query: { barcode: "4006381333931" } });
      expect(searchPhrase.value).toBe("");
      expect(handleSearch).not.toHaveBeenCalled();
    });
  });

  describe("onBarcodeScanned", () => {
    // Leaving the overlay open would cover the results page the push navigates to.
    it("closes the search results overlay before navigating", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      createComposable().onBarcodeScanned("4006381333931");

      expect(hideSearchResults).toHaveBeenCalledOnce();
      expect(hideSearchResults.mock.invocationCallOrder[0]).toBeLessThan(routerPush.mock.invocationCallOrder[0]);
    });

    // The `search` event carries what the search found, so the results page sends it once it has the results.
    // The pending scan is module state, so each of these tests scans a code of its own.
    it("leaves the scanned code for the results page to report, once", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      createComposable().onBarcodeScanned("5901234123457");

      expect(takeUnreportedScan("5901234123457")).toBe(true);
      expect(takeUnreportedScan("5901234123457")).toBe(false);
    });

    // A slower fetch for an earlier code must not use up the report owed to the latest scan.
    it("keeps the report for a fetch of the scanned code only", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      createComposable().onBarcodeScanned("5901234123464");

      expect(takeUnreportedScan("5901234123457")).toBe(false);
      expect(takeUnreportedScan("5901234123464")).toBe(true);
    });

    // The push fails with a "duplicated" navigation, so no request of the results page would take the report.
    it("drops the report when the scanned code is already on screen", async () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');
      routerPush.mockResolvedValueOnce({ type: 16, from: {}, to: {} });

      createComposable().onBarcodeScanned("5901234123488");
      await flushPromises();

      expect(takeUnreportedScan("5901234123488")).toBe(false);
    });

    it("drops the report when the navigation fails", async () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');
      routerPush.mockRejectedValueOnce(new Error("guard failed"));

      createComposable().onBarcodeScanned("5901234123495");
      await flushPromises();

      expect(takeUnreportedScan("5901234123495")).toBe(false);
    });

    // A later scan owns the report; an earlier scan's failed navigation must not drop it.
    it("keeps a newer scan's report when an earlier navigation fails", async () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');
      routerPush.mockResolvedValueOnce({ type: 8, from: {}, to: {} });

      const { onBarcodeScanned } = createComposable();

      onBarcodeScanned("5901234123501");
      onBarcodeScanned("5901234123518");
      await flushPromises();

      expect(takeUnreportedScan("5901234123518")).toBe(true);
    });

    // The phrase path goes through the dropdown, which reports its own `search` event.
    it("leaves nothing to report when the code is searched as a phrase", () => {
      createComposable().onBarcodeScanned("5901234123471");

      expect(takeUnreportedScan("5901234123471")).toBe(false);
    });

    it("ignores an empty code", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      const { onBarcodeScanned } = createComposable();

      onBarcodeScanned("");

      expect(routerPush).not.toHaveBeenCalled();
      expect(searchPhrase.value).toBe("");
      expect(handleSearch).not.toHaveBeenCalled();
      expect(hideSearchResults).not.toHaveBeenCalled();
    });
  });
});
