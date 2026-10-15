import { describe, expect, it, vi } from "vitest";
import { useSalesRepCustomersCount, useSharedSalesRepCustomersCount } from "./useSalesRepCustomersCount";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const useQuery = vi.fn(() => ({ result: ref(undefined), loading: ref(false), onError: vi.fn() }));
  return { useQuery };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: queryMock.useQuery,
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store" },
}));

describe("useSalesRepCustomersCount", () => {
  it("hides the badge instead of throwing when the query cannot start", () => {
    queryMock.useQuery.mockImplementationOnce(() => {
      throw new Error("Apollo client with id default not found");
    });

    expect(() => useSalesRepCustomersCount()).not.toThrow();
    expect(useSalesRepCustomersCount().count.value).toBe(0);
  });

  it("keeps the shared instance usable after a failed first build", () => {
    queryMock.useQuery.mockImplementationOnce(() => {
      throw new Error("Apollo client with id default not found");
    });

    // The shared wrapper counts a subscriber before running the composable, so a throw here would
    // leave every later surface reading `undefined` for the rest of the session.
    const first = useSharedSalesRepCustomersCount();
    const second = useSharedSalesRepCustomersCount();

    expect(first.count.value).toBe(0);
    expect(second.count.value).toBe(0);
  });
});
