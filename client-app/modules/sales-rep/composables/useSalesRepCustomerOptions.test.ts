import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { useSalesRepCustomerOptions } from "./useSalesRepCustomerOptions";
import type { SalesRepCustomerOptionsQuery } from "../api/graphql/types";
import type { EffectScope } from "vue";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref: reactiveRef } = await import("vue");
  const result = reactiveRef<SalesRepCustomerOptionsQuery | undefined>(undefined);
  const loading = reactiveRef(false);
  const onError = vi.fn();
  const onResult = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, onError, onResult }));
  return { result, loading, onError, onResult, useQuery };
});

const loggerMock = await vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn() }));

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: loggerMock }));

type CustomerItemsType = NonNullable<SalesRepCustomerOptionsQuery["salesRepCustomers"]>["items"];

function customersResult(totalCount: number, items: CustomerItemsType) {
  return { salesRepCustomers: { totalCount, items } };
}

/** The args of the most recent useQuery call (the mock impl is param-less, so read them untyped). */
function lastCallArgs(): unknown[] {
  return queryMock.useQuery.mock.calls.at(-1) ?? [];
}

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables() {
  const variables = lastCallArgs()[1] as
    { value: { storeId?: string; first: number; after: string; keyword: string; sort?: string } } | undefined;

  if (!variables) {
    throw new Error("useQuery was not called with variables");
  }

  return variables.value;
}

let scope: EffectScope;

/**
 * The composable registers a watcher, which a component's setup scope would own and dispose. Tests have no such
 * scope, so instances from earlier cases would keep reacting to the shared `result` ref and double-count the logs.
 */
function build() {
  return scope.run(() => useSalesRepCustomerOptions())!;
}

/** Answers the page the composable is currently asking for. */
async function respondWith(totalCount: number, items: CustomerItemsType) {
  queryMock.result.value = customersResult(totalCount, items);
  await nextTick();
}

function failQuery(error = new Error("boom")) {
  (queryMock.onError.mock.calls[0][0] as (e: Error) => void)(error);
}

beforeEach(() => {
  scope = effectScope();
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.useQuery.mockClear();
  queryMock.onError.mockClear();
  queryMock.onResult.mockClear();
  loggerMock.warn.mockClear();
  loggerMock.error.mockClear();
});

afterEach(() => {
  scope.stop();
});

describe("useSalesRepCustomerOptions", () => {
  it("queries the caller's served customers, name-sorted, a page at a time", () => {
    build();

    // No keyword: `VcSelect` filters over the items it was handed and gives the composable no search text to send.
    expect(passedVariables()).toEqual({
      storeId: "test-store",
      first: 100,
      after: "0",
      keyword: "",
      sort: "name:asc",
    });
  });

  it("maps items to the option shape, location included", async () => {
    const { options } = build();

    await respondWith(2, [
      { organizationId: "org-1", organizationName: "Acme Inc.", address: { city: "Richmond", regionName: "Virginia" } },
      { organizationId: "org-2", organizationName: "Globex" },
    ] as CustomerItemsType);

    expect(options.value).toEqual([
      { organizationId: "org-1", organizationName: "Acme Inc.", location: "Richmond, Virginia" },
      { organizationId: "org-2", organizationName: "Globex", location: "" },
    ]);
  });

  it("falls back to the organization id when the name is missing, so no option renders blank", async () => {
    const { options } = build();

    await respondWith(1, [{ organizationId: "org-1" }] as CustomerItemsType);

    expect(options.value).toEqual([{ organizationId: "org-1", organizationName: "org-1", location: "" }]);
  });

  it("returns an empty list (not undefined) before the query resolves", () => {
    const { options } = build();

    expect(options.value).toEqual([]);
  });

  describe("loading everything the rep serves", () => {
    it("asks for the next page while customers are still missing, and keeps the pages already in", async () => {
      const { options } = build();

      await respondWith(2, [{ organizationId: "org-1", organizationName: "Acme" }] as CustomerItemsType);

      expect(passedVariables().after).toBe("100");

      await respondWith(2, [{ organizationId: "org-2", organizationName: "Globex" }] as CustomerItemsType);

      // Replacing instead of accumulating would leave the client-side filter searching one page of the set.
      expect(options.value.map((option) => option.organizationId)).toEqual(["org-1", "org-2"]);
      expect(passedVariables().after).toBe("100");
    });

    it("stops once every served customer is in", async () => {
      build();

      await respondWith(1, [{ organizationId: "org-1", organizationName: "Acme" }] as CustomerItemsType);

      expect(passedVariables().after).toBe("0");
    });

    it("stops on an empty page, whatever the count claims", async () => {
      build();

      await respondWith(500, []);

      expect(passedVariables().after).toBe("0");
    });

    it("keeps loading until the set is complete", async () => {
      const { loading } = build();

      await respondWith(2, [{ organizationId: "org-1", organizationName: "Acme" }] as CustomerItemsType);

      expect(loading.value).toBe(true);

      await respondWith(2, [{ organizationId: "org-2", organizationName: "Globex" }] as CustomerItemsType);

      expect(loading.value).toBe(false);
    });

    it("gives up and says so rather than paging forever", async () => {
      build();

      // Every page answers with one customer out of a much larger total, so the cap is what ends it.
      for (let index = 0; index < 25; index++) {
        await respondWith(5000, [
          { organizationId: `org-${index}`, organizationName: `Org ${index}` },
        ] as CustomerItemsType);
      }

      expect(passedVariables().after).toBe("1900");
      expect(loggerMock.warn).toHaveBeenCalledOnce();
      expect(loggerMock.warn.mock.calls[0][0]).toContain("5000");
    });
  });

  describe("resolving a name the picker is no longer showing", () => {
    it("still knows a customer from a page already loaded", async () => {
      const { findOption } = build();

      await respondWith(1, [
        { organizationId: "org-1", organizationName: "Acme Inc.", address: { city: "Richmond" } },
      ] as CustomerItemsType);

      expect(findOption("org-1")).toEqual({
        organizationId: "org-1",
        organizationName: "Acme Inc.",
        location: "Richmond",
      });
    });

    it("knows nothing about a customer no page ever carried", async () => {
      const { findOption } = build();

      await respondWith(1, [{ organizationId: "org-1", organizationName: "Acme" }] as CustomerItemsType);

      expect(findOption("org-far")).toBeUndefined();
    });
  });

  it("logs a query failure instead of throwing at the call site", () => {
    build();

    failQuery();

    expect(loggerMock.error).toHaveBeenCalledOnce();
  });

  describe("reporting a failed load", () => {
    it("starts out not failed", () => {
      const { failed } = build();

      expect(failed.value).toBe(false);
    });

    it("flags a failure so the caller can say so on the field", () => {
      const { failed } = build();

      failQuery();

      expect(failed.value).toBe(true);
    });

    it("clears the flag once a later attempt comes back", () => {
      const { failed } = build();

      failQuery();
      // A retry must not leave the field stuck in an error state.
      (queryMock.onResult.mock.calls[0][0] as () => void)();

      expect(failed.value).toBe(false);
    });
  });
});
