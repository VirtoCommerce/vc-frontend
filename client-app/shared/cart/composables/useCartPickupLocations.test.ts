import { describe, it, expect, vi, beforeEach } from "vitest";
import { FacetTypes } from "@/core/api/graphql/types";
import { useCartPickupLocations, COUNTRY_NAME_FACET, REGION_NAME_FACET, CITY_FACET } from "./useCartPickupLocations";
import type { CartPickupLocationConnection, ProductPickupLocation, TermFacet } from "@/core/api/graphql/types";

// getCartPickupLocations is the GraphQL operation wrapper the composable calls.
const getCartPickupLocationsMock = vi.hoisted(() => vi.fn());

vi.mock("@/core/api/graphql/cart", () => ({
  getCartPickupLocations: getCartPickupLocationsMock,
}));

// useCartPickupLocations is wrapped in createSharedComposable, which would share state
// across every call within the test run. Mock createSharedComposable to an identity
// pass-through so each invocation gets a fresh, isolated state instance. Keep the rest
// of @vueuse/core intact (other modules rely on noop, etc.).
vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    createSharedComposable: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// getFormattedLabel (used by termFacetToCommonFacet) reads globals.i18n.global.
vi.mock("@/core/globals", () => ({
  globals: {
    storeId: "test-store-id",
    cultureName: "en-US",
    i18n: {
      global: {
        t: (key: string) => key,
        d: (value: unknown) => String(value),
      },
    },
  },
}));

function createLocation(overrides: Partial<ProductPickupLocation> = {}): ProductPickupLocation {
  return {
    id: "loc-1",
    name: "Location 1",
    isActive: true,
    address: { id: "addr-1" },
    ...overrides,
  };
}

function createTermFacet(name: string): TermFacet {
  return {
    facetType: FacetTypes.Terms,
    label: name,
    name,
    terms: [{ count: 1, isSelected: false, label: "Value", term: "value" }],
  };
}

function createConnection(overrides: Partial<CartPickupLocationConnection> = {}): CartPickupLocationConnection {
  return {
    items: [createLocation()],
    totalCount: 1,
    pageInfo: { endCursor: "cursor-1", hasNextPage: false, hasPreviousPage: false, startCursor: undefined },
    filter_facets: [],
    range_facets: [],
    term_facets: [],
    ...overrides,
  };
}

describe("useCartPickupLocations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchPickupLocations (reset)", () => {
    it("should REPLACE the list rather than append on a subsequent fetch", async () => {
      const { fetchPickupLocations, pickupLocations } = useCartPickupLocations();

      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({ items: [createLocation({ id: "page1-a", name: "First page A" })] }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });
      expect(pickupLocations.value.map((l) => l.id)).toEqual(["page1-a"]);

      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [
            createLocation({ id: "page2-a", name: "Second page A" }),
            createLocation({ id: "page2-b", name: "Second page B" }),
          ],
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      // The list equals ONLY the second response's items.
      expect(pickupLocations.value.map((l) => l.id)).toEqual(["page2-a", "page2-b"]);
    });

    it("should expose hasNextPage from pageInfo, recompute facets, and carry endCursor into the next loadMore", async () => {
      const { fetchPickupLocations, loadMorePickupLocations, pickupLocationsHasNextPage, filterOptionsCountries } =
        useCartPickupLocations();

      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          pageInfo: { endCursor: "next-cursor", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
          term_facets: [createTermFacet(COUNTRY_NAME_FACET)],
        }),
      );

      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      expect(pickupLocationsHasNextPage.value).toBe(true);
      expect(filterOptionsCountries.value?.values).toHaveLength(1);

      // The cursor is internal now: assert it behaviorally by checking the next loadMore
      // forwards it as the `after` argument.
      getCartPickupLocationsMock.mockResolvedValueOnce(createConnection());
      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      const loadMoreArg = getCartPickupLocationsMock.mock.calls[1][0] as Record<string, unknown>;
      expect(loadMoreArg.after).toBe("next-cursor");
    });

    it("should NOT pass an after argument", async () => {
      const { fetchPickupLocations } = useCartPickupLocations();

      getCartPickupLocationsMock.mockResolvedValueOnce(createConnection());
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      const callArg = getCartPickupLocationsMock.mock.calls[0][0] as Record<string, unknown>;
      expect(callArg).not.toHaveProperty("after");
    });
  });

  describe("loadMorePickupLocations (append)", () => {
    it("should append new items, advance endCursor, and NOT recompute facets", async () => {
      const {
        fetchPickupLocations,
        loadMorePickupLocations,
        pickupLocations,
        filterOptionsCountries,
        filterOptionsRegions,
        filterOptionsCities,
      } = useCartPickupLocations();

      // Reset call: seed page 1 with facets so we can assert they stay unchanged.
      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [createLocation({ id: "p1-a" }), createLocation({ id: "p1-b" })],
          pageInfo: { endCursor: "cursor-1", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
          term_facets: [
            createTermFacet(COUNTRY_NAME_FACET),
            createTermFacet(REGION_NAME_FACET),
            createTermFacet(CITY_FACET),
          ],
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      const countriesBefore = filterOptionsCountries.value;
      const regionsBefore = filterOptionsRegions.value;
      const citiesBefore = filterOptionsCities.value;

      // Append call: page 2 with NO facets in the response, still more pages to come.
      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [createLocation({ id: "p2-a" }), createLocation({ id: "p2-b" })],
          pageInfo: { endCursor: "cursor-2", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
          term_facets: [],
        }),
      );
      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      // Items appended (page1 then page2).
      expect(pickupLocations.value.map((l) => l.id)).toEqual(["p1-a", "p1-b", "p2-a", "p2-b"]);
      // Facets preserved (loadMore does not recompute them, even though page 2 had none).
      expect(filterOptionsCountries.value).toBe(countriesBefore);
      expect(filterOptionsRegions.value).toBe(regionsBefore);
      expect(filterOptionsCities.value).toBe(citiesBefore);

      // endCursor advanced: the next loadMore forwards page 2's cursor as `after`
      // (the cursor is internal, so it is asserted behaviorally).
      getCartPickupLocationsMock.mockResolvedValueOnce(createConnection());
      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      const secondLoadMoreArg = getCartPickupLocationsMock.mock.calls[2][0] as Record<string, unknown>;
      expect(secondLoadMoreArg.after).toBe("cursor-2");
    });

    it("should send the current endCursor as the after argument", async () => {
      const { fetchPickupLocations, loadMorePickupLocations } = useCartPickupLocations();

      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          pageInfo: { endCursor: "cursor-after", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      getCartPickupLocationsMock.mockResolvedValueOnce(createConnection());
      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      const loadMoreArg = getCartPickupLocationsMock.mock.calls[1][0] as Record<string, unknown>;
      expect(loadMoreArg.after).toBe("cursor-after");
    });
  });

  describe("loadMorePickupLocations guards", () => {
    it("should make NO request and not change the list when hasNextPage is false", async () => {
      const { fetchPickupLocations, loadMorePickupLocations, pickupLocations } = useCartPickupLocations();

      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [createLocation({ id: "only" })],
          pageInfo: { endCursor: "c", hasNextPage: false, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });
      expect(getCartPickupLocationsMock).toHaveBeenCalledTimes(1);

      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      // No additional request, list unchanged.
      expect(getCartPickupLocationsMock).toHaveBeenCalledTimes(1);
      expect(pickupLocations.value.map((l) => l.id)).toEqual(["only"]);
    });

    it("should make NO request while a load is already in flight (loading=true)", async () => {
      const { fetchPickupLocations, loadMorePickupLocations, pickupLocationsLoading } = useCartPickupLocations();

      // First, set up a state where hasNextPage is true.
      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          pageInfo: { endCursor: "c", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });
      const callsAfterFetch = getCartPickupLocationsMock.mock.calls.length;

      // Drive the loading branch: a load is in flight.
      pickupLocationsLoading.value = true;
      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      // Guard short-circuited: no new request.
      expect(getCartPickupLocationsMock.mock.calls).toHaveLength(callsAfterFetch);
    });
  });

  describe("dedup keep-first invariant (BL-BOPIS-008)", () => {
    it("should keep the first (page-1) occurrence and not overwrite it with the page-2 version", async () => {
      const { fetchPickupLocations, loadMorePickupLocations, pickupLocations } = useCartPickupLocations();

      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [createLocation({ id: "dup", name: "Original page-1 name" })],
          pageInfo: { endCursor: "c1", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [
            createLocation({ id: "dup", name: "Replacement page-2 name" }),
            createLocation({ id: "fresh", name: "Fresh page-2 item" }),
          ],
          pageInfo: { endCursor: "c2", hasNextPage: false, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      // The duplicate id appears once, retaining the page-1 name; the unique page-2 item is appended.
      expect(pickupLocations.value.map((l) => l.id)).toEqual(["dup", "fresh"]);
      const dup = pickupLocations.value.find((l) => l.id === "dup");
      expect(dup?.name).toBe("Original page-1 name");
    });
  });

  describe("stale-response races", () => {
    it("should DROP a loadMore response that resolves after a fresh fetch (no stale append, no cursor overwrite)", async () => {
      const { fetchPickupLocations, loadMorePickupLocations, pickupLocations, pickupLocationsHasNextPage } =
        useCartPickupLocations();

      // Seed an initial fetch so hasNextPage=true and a cursor is set; loadMore can pass its guard.
      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [createLocation({ id: "seed-a" })],
          pageInfo: { endCursor: "seed-cursor", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      // loadMore returns a promise we resolve manually, so we control resolution order.
      let resolveLoadMore!: (v: unknown) => void;
      const loadMorePromise = new Promise((res) => {
        resolveLoadMore = res;
      });
      getCartPickupLocationsMock.mockReturnValueOnce(loadMorePromise);

      // Start loadMore (passes guard now: hasNextPage true, not loading), but do NOT await yet.
      const loadMoreCall = loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      // A fresh fetch starts and completes; it bumps fetchGeneration, superseding the in-flight loadMore.
      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [createLocation({ id: "fresh-a" }), createLocation({ id: "fresh-b" })],
          pageInfo: { endCursor: "fresh-cursor", hasNextPage: false, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      // Now resolve the stale loadMore with distinctive items + different page info.
      resolveLoadMore(
        createConnection({
          items: [createLocation({ id: "stale-a" }), createLocation({ id: "stale-b" })],
          pageInfo: { endCursor: "stale-cursor", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await loadMoreCall;

      // The stale loadMore items are NOT appended; the list equals only the fresh fetch's items.
      expect(pickupLocations.value.map((l) => l.id)).toEqual(["fresh-a", "fresh-b"]);
      // Pagination reflects the fresh fetch, not the stale loadMore response.
      expect(pickupLocationsHasNextPage.value).toBe(false);
    });
  });

  describe("error handling preserves state", () => {
    it("should preserve the previous list, hasNextPage, and cursor when a fetch throws", async () => {
      const { fetchPickupLocations, loadMorePickupLocations, pickupLocations, pickupLocationsHasNextPage } =
        useCartPickupLocations();

      // A successful fetch with more pages to come.
      getCartPickupLocationsMock.mockResolvedValueOnce(
        createConnection({
          items: [createLocation({ id: "kept-a" }), createLocation({ id: "kept-b" })],
          pageInfo: { endCursor: "kept-cursor", hasNextPage: true, hasPreviousPage: false, startCursor: undefined },
        }),
      );
      await fetchPickupLocations({ cartId: "cart-1", first: 6 });

      expect(pickupLocations.value.map((l) => l.id)).toEqual(["kept-a", "kept-b"]);
      expect(pickupLocationsHasNextPage.value).toBe(true);

      // The next fetch rejects.
      getCartPickupLocationsMock.mockRejectedValueOnce(new Error("boom"));
      await expect(fetchPickupLocations({ cartId: "cart-1", first: 6 })).rejects.toThrow();

      // List and hasNextPage are preserved (not cleared mid-fetch).
      expect(pickupLocations.value.map((l) => l.id)).toEqual(["kept-a", "kept-b"]);
      expect(pickupLocationsHasNextPage.value).toBe(true);

      // The cursor is internal: assert it survived by checking the next loadMore forwards it as `after`.
      getCartPickupLocationsMock.mockResolvedValueOnce(createConnection());
      await loadMorePickupLocations({ cartId: "cart-1", first: 6 });

      const loadMoreArg = getCartPickupLocationsMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
      expect(loadMoreArg.after).toBe("kept-cursor");
    });
  });
});
