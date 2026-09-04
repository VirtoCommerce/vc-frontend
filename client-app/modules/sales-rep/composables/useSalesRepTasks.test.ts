import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { TASKS_PAGE_SIZE } from "../constants";
import { localDayWindow } from "../tasks";
import { useSalesRepTasks } from "./useSalesRepTasks";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref: hoistedRef } = await import("vue");
  const result = hoistedRef<{ salesRepTasks?: { totalCount?: number; items?: unknown[] } } | undefined>(undefined);
  const useQuery = vi.fn(() => ({
    result,
    loading: hoistedRef(false),
    error: hoistedRef(null),
    onError: vi.fn(),
    refetch: vi.fn(),
  }));
  return { result, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables(): { first: number; after: string; filter?: string; period?: { from: string; to: string } } {
  const call = (queryMock.useQuery.mock.calls.at(-1) ?? []) as unknown[];
  return (call[1] as { value: ReturnType<typeof passedVariables> }).value;
}

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.useQuery.mockClear();
});

describe("useSalesRepTasks paging", () => {
  it("asks for the page as an offset", () => {
    const { page } = useSalesRepTasks();

    page.value = 3;

    expect(passedVariables()).toMatchObject({ first: TASKS_PAGE_SIZE, after: String(2 * TASKS_PAGE_SIZE) });
  });

  // Every scope change goes back to page 1 synchronously — before apollo's own variables watcher runs — so the
  // request that follows carries offset 0, not a page-3 offset into a scope that may hold two rows.
  it("returns to page 1 when the day window changes, before the request goes out", () => {
    const period = ref<{ from: string; to: string } | undefined>(localDayWindow("2026-10-15"));
    const { page } = useSalesRepTasks({ period });
    page.value = 3;

    period.value = localDayWindow("2026-10-16");

    expect(page.value).toBe(1);
    expect(passedVariables()).toMatchObject({ after: "0", period: localDayWindow("2026-10-16") });
  });

  it("returns to page 1 when the tab changes", () => {
    const filter = ref<string | undefined>(undefined);
    const { page } = useSalesRepTasks({ filter });
    page.value = 2;

    filter.value = "overdue";

    expect(page.value).toBe(1);
    expect(passedVariables()).toMatchObject({ after: "0", filter: "overdue" });
  });
});
