import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBarcodeSearchRoute, shouldOpenSingleBarcodeHit, useBarcodeSearch } from "./useBarcodeSearch";

const { routerPush, trackEvent, settingValues } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  trackEvent: vi.fn(),
  settingValues: new Map<string, unknown>(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/core/composables", () => ({
  useAnalytics: () => ({ analytics: trackEvent }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ getSettingValue: (name: string) => settingValues.get(name) }),
}));

const ENABLED_KEY = "Catalog.Search.BarcodeScannerEnabled";
const FIELDS_KEY = "Catalog.Search.BarcodeSearchFields";

const searchFullText = vi.fn();
const hideSearchResults = vi.fn();

function createComposable() {
  return useBarcodeSearch({ searchFullText, hideSearchResults });
}

beforeEach(() => {
  settingValues.clear();
  routerPush.mockClear();
  trackEvent.mockClear();
  searchFullText.mockClear();
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
      ["an empty array", "[]"],
      ["invalid JSON", "[gtin"],
      ["an object", '{"field":"gtin"}'],
      ["an array of non-strings", "[1,2]"],
    ])("searches the code as a phrase when the setting is %s", (_case, value) => {
      if (value !== undefined) {
        settingValues.set(FIELDS_KEY, value);
      }

      scan();

      expect(searchFullText).toHaveBeenCalledWith("4006381333931");
      expect(routerPush).not.toHaveBeenCalled();
    });

    it.each([
      ["one field", '["gtin"]'],
      ["several fields", '["gtin","code","manufacturerPartNumber"]'],
    ])("navigates to the barcode results when the setting holds %s", (_case, value) => {
      settingValues.set(FIELDS_KEY, value);

      scan();

      expect(routerPush).toHaveBeenCalledWith({ name: "Search", query: { barcode: "4006381333931" } });
      expect(searchFullText).not.toHaveBeenCalled();
    });
  });

  describe("getBarcodeSearchRoute", () => {
    it("navigates to the search results page with the code in its own query param", () => {
      expect(getBarcodeSearchRoute("4006381333931")).toEqual({
        name: "Search",
        query: { barcode: "4006381333931" },
      });
    });
  });

  describe("onBarcodeScanned", () => {
    it("searches the code as a phrase when no fields are configured", () => {
      const { onBarcodeScanned } = createComposable();

      onBarcodeScanned("4006381333931");

      expect(searchFullText).toHaveBeenCalledWith("4006381333931");
      expect(routerPush).not.toHaveBeenCalled();
    });

    it("navigates to the barcode search results when fields are configured", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      const { onBarcodeScanned } = createComposable();

      onBarcodeScanned("4006381333931");

      expect(routerPush).toHaveBeenCalledWith({ name: "Search", query: { barcode: "4006381333931" } });
      expect(searchFullText).not.toHaveBeenCalled();
    });

    // Leaving the overlay open would cover the results page the push navigates to.
    it("closes the search results overlay before navigating", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      createComposable().onBarcodeScanned("4006381333931");

      expect(hideSearchResults).toHaveBeenCalledOnce();
      expect(hideSearchResults.mock.invocationCallOrder[0]).toBeLessThan(routerPush.mock.invocationCallOrder[0]);
    });

    // Parity with the full-text path, which reports the phrase it navigated with.
    it("reports the scanned code as a search event", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      createComposable().onBarcodeScanned("4006381333931");

      expect(trackEvent).toHaveBeenCalledWith("search", "4006381333931");
    });

    it("ignores an empty code", () => {
      settingValues.set(FIELDS_KEY, '["gtin"]');

      const { onBarcodeScanned } = createComposable();

      onBarcodeScanned("");

      expect(routerPush).not.toHaveBeenCalled();
      expect(searchFullText).not.toHaveBeenCalled();
      expect(hideSearchResults).not.toHaveBeenCalled();
    });
  });
});
