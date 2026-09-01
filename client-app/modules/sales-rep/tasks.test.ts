import { describe, expect, it } from "vitest";
import {
  buildDayMarkers,
  localCalendarWindow,
  localDayKey,
  localDayKeyToIso,
  localDayWindow,
  startOfLocalDay,
  taskStatus,
  toMonthKey,
} from "./tasks";
import type { SalesRepTaskStatusType } from "./types/tasks";

// Everything here is deliberately expressed in LOCAL time and compared against locally-constructed dates, never
// against literal ISO strings: the whole point of these helpers is that a day is a day on the viewer's calendar,
// so asserting UTC text would only pass in one timezone.

const DAY_START = startOfLocalDay(new Date(2026, 4, 28, 9, 30));

function task(overrides: Partial<{ isActive: boolean; completed: boolean | null; dueDate: string | null }> = {}) {
  return { isActive: true, completed: null, dueDate: null, ...overrides };
}

function isoAt(year: number, month: number, day: number, hours = 0, minutes = 0): string {
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

describe("startOfLocalDay", () => {
  it("strips the time, keeping the local calendar day", () => {
    const result = startOfLocalDay(new Date(2026, 4, 28, 23, 59, 59, 999));

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(28);
    expect(result.getHours()).toBe(0);
  });
});

describe("localDayKey", () => {
  it("pads month and day", () => {
    expect(localDayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("reads an instant on the viewer's calendar, not UTC's", () => {
    // Late-evening local time: slicing the ISO string would give the NEXT day for any negative UTC offset.
    const evening = new Date(2026, 4, 28, 23, 30);

    expect(localDayKey(evening.toISOString())).toBe("2026-05-28");
  });
});

describe("taskStatus", () => {
  it("reads a finished task as completed", () => {
    expect(taskStatus(task({ isActive: false, completed: true, dueDate: isoAt(2026, 5, 1) }), DAY_START)).toBe(
      "completed",
    );
  });

  it("reads a closed-but-unfinished task as canceled", () => {
    expect(taskStatus(task({ isActive: false, completed: false }), DAY_START)).toBe("canceled");
    expect(taskStatus(task({ isActive: false, completed: null }), DAY_START)).toBe("canceled");
  });

  it("reads an open task due before today as overdue", () => {
    expect(taskStatus(task({ dueDate: isoAt(2026, 5, 27, 23, 59) }), DAY_START)).toBe("overdue");
  });

  it("reads a task due at exactly midnight today as upcoming, not overdue", () => {
    // The boundary the backend's filter rules use: overdue is strictly BEFORE the start of today.
    expect(taskStatus(task({ dueDate: isoAt(2026, 5, 28, 0, 0) }), DAY_START)).toBe("upcoming");
  });

  it("reads a task due later today as upcoming", () => {
    expect(taskStatus(task({ dueDate: isoAt(2026, 5, 28, 9, 0) }), DAY_START)).toBe("upcoming");
  });

  it("reads an open task with no due date as upcoming", () => {
    // Only the admin app can create one; the storefront's inputs make the due date non-null.
    expect(taskStatus(task({ dueDate: null }), DAY_START)).toBe("upcoming");
  });
});

describe("buildDayMarkers", () => {
  it("collapses many tasks of one kind on a day into a single marker", () => {
    const markers = buildDayMarkers([
      { dueDate: isoAt(2026, 5, 28, 8), status: "overdue" },
      { dueDate: isoAt(2026, 5, 28, 12), status: "overdue" },
      { dueDate: isoAt(2026, 5, 28, 17), status: "overdue" },
    ]);

    expect(markers["2026-05-28"]).toEqual(["overdue"]);
  });

  it("keeps one marker per distinct kind, in a stable order", () => {
    const markers = buildDayMarkers([
      { dueDate: isoAt(2026, 5, 28, 8), status: "completed" },
      { dueDate: isoAt(2026, 5, 28, 9), status: "upcoming" },
      { dueDate: isoAt(2026, 5, 28, 10), status: "overdue" },
      { dueDate: isoAt(2026, 5, 28, 11), status: "upcoming" },
    ]);

    // Declaration order, not arrival order, so the dots do not reshuffle between renders.
    expect(markers["2026-05-28"]).toEqual(["upcoming", "overdue", "completed"]);
  });

  it("buckets by the viewer's day and skips tasks with no due date", () => {
    const markers = buildDayMarkers([
      { dueDate: isoAt(2026, 5, 28, 23, 30), status: "upcoming" },
      { dueDate: isoAt(2026, 5, 29, 0, 30), status: "overdue" },
      { dueDate: null, status: "upcoming" },
    ]);

    // ISO keys sort chronologically under a plain string compare; the comparator is explicit for clarity.
    expect(Object.keys(markers).sort((a, b) => a.localeCompare(b))).toEqual(["2026-05-28", "2026-05-29"]);
  });

  it("honours a caller-supplied kind order and drops kinds outside it", () => {
    const order: SalesRepTaskStatusType[] = ["overdue", "upcoming"];
    const markers = buildDayMarkers(
      [
        { dueDate: isoAt(2026, 5, 28, 8), status: "completed" },
        { dueDate: isoAt(2026, 5, 28, 9), status: "upcoming" },
        { dueDate: isoAt(2026, 5, 28, 10), status: "overdue" },
      ],
      order,
    );

    expect(markers["2026-05-28"]).toEqual(["overdue", "upcoming"]);
  });
});

describe("localDayWindow", () => {
  it("spans exactly the one local day, inclusive", () => {
    const { from, to } = localDayWindow("2026-05-28");

    expect(new Date(from).getTime()).toBe(new Date(2026, 4, 28, 0, 0, 0, 0).getTime());
    expect(new Date(to).getTime()).toBe(new Date(2026, 4, 28, 23, 59, 59, 999).getTime());
  });
});

describe("localCalendarWindow", () => {
  it("pads a week either side, because the grid renders adjacent-month days that also carry dots", () => {
    const { from, to } = localCalendarWindow("2026-05-01");

    // A week before May 1 and a week past May 31 — enough for `fixed-weeks` under any first-day-of-week.
    expect(new Date(from).getTime()).toBe(new Date(2026, 3, 24).getTime());
    expect(new Date(to).getTime()).toBe(new Date(2026, 5, 7, 23, 59, 59, 999).getTime());
  });

  it("crosses a year boundary correctly", () => {
    const { from } = localCalendarWindow("2026-01-01");

    expect(new Date(from).getFullYear()).toBe(2025);
    expect(new Date(from).getMonth()).toBe(11);
  });
});

describe("toMonthKey", () => {
  it("normalizes any day to the first of its month", () => {
    expect(toMonthKey("2026-05-28")).toBe("2026-05-01");
    expect(toMonthKey(new Date(2026, 11, 31))).toBe("2026-12-01");
  });
});

describe("localDayKeyToIso", () => {
  it("round-trips through localDayKey", () => {
    expect(localDayKey(localDayKeyToIso("2026-05-28"))).toBe("2026-05-28");
  });

  it("lands on local midnight, so the picked day is the day the calendar shows it on", () => {
    expect(new Date(localDayKeyToIso("2026-05-28")).getTime()).toBe(new Date(2026, 4, 28).getTime());
  });
});
