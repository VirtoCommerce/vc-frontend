import { describe, expect, it } from "vitest";
import {
  buildDayMarkers,
  dueDateForDay,
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

    expect(markers["2026-05-28"]).toEqual({ kinds: ["overdue"], count: 3 });
  });

  it("keeps one marker per distinct kind, in a stable order", () => {
    const markers = buildDayMarkers([
      { dueDate: isoAt(2026, 5, 28, 8), status: "completed" },
      { dueDate: isoAt(2026, 5, 28, 9), status: "upcoming" },
      { dueDate: isoAt(2026, 5, 28, 10), status: "overdue" },
      { dueDate: isoAt(2026, 5, 28, 11), status: "upcoming" },
    ]);

    // Declaration order, not arrival order, so the dots do not reshuffle between renders.
    expect(markers["2026-05-28"].kinds).toEqual(["upcoming", "overdue", "completed"]);
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

    expect(markers["2026-05-28"].kinds).toEqual(["overdue", "upcoming"]);
  });

  // The dots collapse a day to one mark per condition; the count is what survives that collapse, and the
  // only thing a screen reader can be told about how much is actually there.
  it("counts every task due on the day, however few dots it earns", () => {
    const markers = buildDayMarkers([
      { dueDate: isoAt(2026, 5, 28, 8), status: "overdue" },
      { dueDate: isoAt(2026, 5, 28, 12), status: "overdue" },
      { dueDate: isoAt(2026, 5, 28, 17), status: "upcoming" },
    ]);

    expect(markers["2026-05-28"]).toEqual({ kinds: ["upcoming", "overdue"], count: 3 });
  });

  // A canceled task earns no dot but is still due that day, and still shows up in the day's list.
  it("counts a task whose kind draws nothing", () => {
    const markers = buildDayMarkers([
      { dueDate: isoAt(2026, 5, 28, 8), status: "upcoming" },
      { dueDate: isoAt(2026, 5, 28, 9), status: "canceled" },
    ]);

    expect(markers["2026-05-28"]).toEqual({ kinds: ["upcoming"], count: 2 });
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
  it("pads either side, because the grid renders adjacent-month days that also carry dots", () => {
    const { from, to } = localCalendarWindow("2026-05-01");

    expect(new Date(from).getTime()).toBe(new Date(2026, 3, 24).getTime());
    expect(new Date(to).getTime()).toBe(new Date(2026, 5, 14, 23, 59, 59, 999).getTime());
  });

  // The edges are not symmetric. February 2026 starts on a Sunday, so a 42-cell grid shows 28 own days and then
  // 14 of March - the worst case, and exactly what a 7-day trailing pad used to leave dotless.
  it("reaches the last cell of the worst-case grid", () => {
    const { from, to } = localCalendarWindow("2026-02-01");

    expect(new Date(from).getTime()).toBeLessThanOrEqual(new Date(2026, 1, 1).getTime());
    expect(new Date(to).getTime()).toBeGreaterThanOrEqual(new Date(2026, 2, 14, 23, 59, 59, 999).getTime());
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

describe("dueDateForDay", () => {
  // Built from a local Date, so the fixture sits on the same local day whatever timezone the suite runs in.
  const TIMED = new Date(2026, 4, 28, 7, 15, 30, 250).toISOString();

  // Creating: nothing earlier to preserve, so the task starts at the beginning of the chosen day.
  it("starts a new task at the beginning of the chosen day", () => {
    expect(dueDateForDay("2026-05-28")).toBe(localDayKeyToIso("2026-05-28"));
  });

  // The point of the whole function: update REPLACES the task, so an untouched date has to round-trip byte
  // for byte, or editing the title alone moves the deadline to midnight (VCST-5732 QA A-1).
  it("returns the original instant untouched when the day did not change", () => {
    expect(dueDateForDay("2026-05-28", TIMED)).toBe(TIMED);
  });

  it("carries the time of day over when the task moves to another day", () => {
    const moved = new Date(dueDateForDay("2026-05-29", TIMED));

    expect(localDayKey(moved)).toBe("2026-05-29");
    expect([moved.getHours(), moved.getMinutes(), moved.getSeconds(), moved.getMilliseconds()]).toEqual([
      7, 15, 30, 250,
    ]);
  });

  // A task the rep created here has no time to keep; it must not gain one on the way out either.
  it("keeps a midnight task at midnight when it moves", () => {
    const moved = dueDateForDay("2026-05-29", localDayKeyToIso("2026-05-28"));

    expect(moved).toBe(localDayKeyToIso("2026-05-29"));
  });
});
