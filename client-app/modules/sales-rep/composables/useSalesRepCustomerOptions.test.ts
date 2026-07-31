import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useSalesRepCustomerOptions } from "./useSalesRepCustomerOptions";
import type { SalesRepCustomersQuery } from "../api/graphql/types";
import type { EffectScope, Ref } from "vue";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref: reactiveRef } = await import("vue");
  const result = reactiveRef<SalesRepCustomersQuery | undefined>(undefined);
  const loading = reactiveRef(false);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, onError }));
  return { result, loading, onError, useQuery };
});

const loggerMock = await vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn() }));

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: loggerMock }));

type CustomerItemsType = NonNullable<SalesRepCustomersQuery["salesRepCustomers"]>["items"];

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

/** The options object (3rd arg) the composable handed to useQuery. */
function passedOptions() {
  return lastCallArgs()[2] as { enabled?: unknown } | undefined;
}

let scope: EffectScope;

/**
 * The composable registers a watcher, which a component's setup scope would own and dispose. Tests have no such
 * scope, so instances from earlier cases would keep reacting to the shared `result` ref and double-count the logs.
 */
function build() {
  return scope.run(() => useSalesRepCustomerOptions())!;
}

function buildWith(enabled: Ref<boolean>) {
  return scope.run(() => useSalesRepCustomerOptions(enabled))!;
}

beforeEach(() => {
  scope = effectScope();
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.useQuery.mockClear();
  queryMock.onError.mockClear();
  loggerMock.warn.mockClear();
  loggerMock.error.mockClear();
});

afterEach(() => {
  scope.stop();
});

describe("useSalesRepCustomerOptions", () => {
  it("queries the caller's served customers, name-sorted, without a keyword filter", () => {
    build();

    // No keyword: the picker filters client-side, so the whole (capped) page is fetched once.
    expect(passedVariables()).toEqual({
      storeId: "test-store",
      first: 100,
      after: "0",
      keyword: "",
      sort: "name:asc",
    });
  });

  it("forwards the `enabled` gate to useQuery so non-reps never issue the authorized request", () => {
    const enabled = ref(false);

    buildWith(enabled);

    expect(passedOptions()?.enabled).toBe(enabled);
  });

  it("maps items to {organizationId, organizationName} option shape", () => {
    const { options } = build();

    queryMock.result.value = customersResult(2, [
      { organizationId: "org-1", organizationName: "Acme Inc." },
      { organizationId: "org-2", organizationName: "Globex" },
    ] as CustomerItemsType);

    expect(options.value).toEqual([
      { organizationId: "org-1", organizationName: "Acme Inc." },
      { organizationId: "org-2", organizationName: "Globex" },
    ]);
  });

  it("falls back to the organization id when the name is missing, so no option renders blank", () => {
    const { options } = build();

    queryMock.result.value = customersResult(1, [{ organizationId: "org-1" }] as CustomerItemsType);

    expect(options.value).toEqual([{ organizationId: "org-1", organizationName: "org-1" }]);
  });

  it("returns an empty list (not undefined) before the query resolves", () => {
    const { options, totalCount } = build();

    expect(options.value).toEqual([]);
    expect(totalCount.value).toBe(0);
  });

  it("warns when the rep serves more customers than the picker can list", async () => {
    build();

    queryMock.result.value = customersResult(140, [
      { organizationId: "org-1", organizationName: "Acme" },
    ] as CustomerItemsType);
    await nextTick();

    // Client-side filtering would otherwise hide the overflow, reading as a missing customer rather than a cap.
    expect(loggerMock.warn).toHaveBeenCalledOnce();
    expect(loggerMock.warn.mock.calls[0][0]).toContain("140");
  });

  it("stays quiet when the served customers fit within the cap", async () => {
    build();

    queryMock.result.value = customersResult(100, []);
    await nextTick();

    expect(loggerMock.warn).not.toHaveBeenCalled();
  });

  it("logs a query failure instead of throwing at the call site", () => {
    build();

    const handler = queryMock.onError.mock.calls[0][0] as (error: Error) => void;
    handler(new Error("boom"));

    expect(loggerMock.error).toHaveBeenCalledOnce();
  });
});
