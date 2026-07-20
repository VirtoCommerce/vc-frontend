import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepOrderStatuses } from "./useSalesRepOrderStatuses";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<{ salesRepOrderStatuses?: Array<Record<string, unknown> | null> | null } | undefined>(undefined);
  const loading = ref(false);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, onError }));
  return { result, loading, onError, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US" } }));

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables(): { storeId?: string; cultureName?: string } {
  const call = (queryMock.useQuery.mock.calls.at(-1) ?? []) as unknown[];
  const variables = call[1] as { value: { storeId?: string; cultureName?: string } } | undefined;
  if (!variables) {
    throw new Error("useQuery was not called with variables");
  }
  return variables.value;
}

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.useQuery.mockClear();
  queryMock.onError.mockClear();
});

describe("useSalesRepOrderStatuses", () => {
  it("scopes the query to the current store and culture", () => {
    useSalesRepOrderStatuses();

    expect(passedVariables()).toEqual({ storeId: "test-store", cultureName: "en-US" });
  });

  it("maps statuses, falls back localizedName to name, and skips null items", () => {
    const { statuses } = useSalesRepOrderStatuses();

    queryMock.result.value = {
      salesRepOrderStatuses: [
        { name: "New", localizedName: "Nuevo" },
        null,
        { name: "Completed" }, // no localizedName -> falls back to the stable name
      ],
    };

    expect(statuses.value).toEqual([
      { name: "New", localizedName: "Nuevo" },
      { name: "Completed", localizedName: "Completed" },
    ]);
  });

  it("returns an empty list when the query has no result yet", () => {
    const { statuses } = useSalesRepOrderStatuses();

    expect(statuses.value).toEqual([]);
  });

  it("passes loading through and registers an error handler", () => {
    const { loading } = useSalesRepOrderStatuses();

    queryMock.loading.value = true;
    expect(loading.value).toBe(true);

    expect(queryMock.onError).toHaveBeenCalledTimes(1);
  });
});
