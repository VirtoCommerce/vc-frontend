import { beforeEach, describe, expect, it, vi } from "vitest";
import { localDayKey, localDayWindow } from "../tasks";
import { useSalesRepTaskCounts } from "./useSalesRepTaskCounts";

type CountsResultType = Record<string, { totalCount?: number } | undefined>;

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref: hoistedRef } = await import("vue");
  const result = hoistedRef<CountsResultType | undefined>(undefined);
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

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.useQuery.mockClear();
});

describe("useSalesRepTaskCounts", () => {
  // Every alias carries its own number, so a badge wired to the wrong alias shows up as the wrong number.
  it("maps each alias onto its own badge", () => {
    queryMock.result.value = {
      currentDay: { totalCount: 1 },
      all: { totalCount: 2 },
      upcoming: { totalCount: 3 },
      overdue: { totalCount: 4 },
      completed: { totalCount: 5 },
    };

    const { counts } = useSalesRepTaskCounts();

    expect(counts.value).toEqual({ today: 1, all: 2, upcoming: 3, overdue: 4, completed: 5 });
  });

  it("reads zero for every badge until the query answers", () => {
    const { counts } = useSalesRepTaskCounts();

    expect(counts.value).toEqual({ today: 0, all: 0, upcoming: 0, overdue: 0, completed: 0 });
  });

  // The Today badge counts today's window, the same one the Today chip lists.
  it("asks for today's window", () => {
    useSalesRepTaskCounts();

    const call = (queryMock.useQuery.mock.calls.at(-1) ?? []) as unknown[];
    const variables = (call[1] as { value: { todayPeriod: { from: string; to: string } } }).value;

    expect(variables.todayPeriod).toEqual(localDayWindow(localDayKey(new Date())));
  });
});
