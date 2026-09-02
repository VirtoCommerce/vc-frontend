import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SalesRepTaskModal from "../components/sales-rep-task-modal.vue";
import { localDayKey, localDayWindow } from "../tasks";
import Calendar from "./calendar.vue";
import type { SalesRepTaskType } from "../types/tasks";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<SalesRepTaskType[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    filter: ref<string | undefined>(undefined),
    page: ref(1),
    pages: ref(1),
    totalCount: ref(0),
    counts: ref({ all: 0, upcoming: 0, overdue: 0, completed: 0 }),
    rules: ref<{ name: string; label: string }[]>([]),
    rulesFailed: ref(false),
    month: ref("2026-10-01"),
    useSalesRepTasks: vi.fn(),
    refetch: vi.fn(),
    refetchCounts: vi.fn(),
    refetchMarkers: vi.fn(),
    setCompleted: vi.fn(),
    goToToday: vi.fn(),
    openModal: vi.fn(),
  };
});

vi.mock("../composables/useSalesRepTasks", () => ({ useSalesRepTasks: state.useSalesRepTasks }));
vi.mock("../composables/useSalesRepTaskCounts", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepTaskCounts: () => ({
      counts: state.counts,
      loading: ref(false),
      error: ref(null),
      refetch: state.refetchCounts,
    }),
  };
});
vi.mock("../composables/useSalesRepTaskCalendar", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepTaskCalendar: () => ({
      dayMarkers: ref({}),
      loading: ref(false),
      error: ref(null),
      refetch: state.refetchMarkers,
    }),
    useMonthAnchor: () => ({ month: state.month, setMonth: vi.fn(), goToToday: state.goToToday }),
  };
});
vi.mock("../composables/useSalesRepTaskMutations", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepTaskMutations: () => ({
      setCompleted: state.setCompleted,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      loading: ref(false),
    }),
  };
});
vi.mock("../composables/useSalesRepRules", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepRules: () => ({ rules: state.rules, loading: ref(false), failed: state.rulesFailed }),
  };
});
vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: state.openModal }) }));

// Typed arguments, so the format a call asked for can be asserted.
const dMock = vi.hoisted(() =>
  vi.fn((value: unknown, format?: string) => (format === "short" ? "Oct 15, 2026" : String(value))),
);
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
    d: dMock,
    n: String,
  }),
}));

function makeTask(overrides: Partial<SalesRepTaskType> = {}): SalesRepTaskType {
  return {
    id: "task-1",
    name: "Call ACME about the renewal",
    description: "",
    type: "Finance",
    priority: "Normal",
    dueDate: "2026-10-15T00:00:00Z",
    isActive: true,
    completed: undefined,
    createdDate: "2026-10-01T00:00:00Z",
    modifiedDate: undefined,
    status: "upcoming",
    ...overrides,
  };
}

// Named stubs, so the tests can read what the page handed each child and emit back through it.
const ChipsStub = {
  name: "SalesRepRuleChips",
  props: ["modelValue", "rules", "allLabel", "allCount", "loading"],
  template: '<div class="chips" />',
};

const ListStub = {
  name: "SalesRepTaskList",
  props: ["tasks", "loading", "busy", "page", "pages"],
  emits: ["toggle", "edit", "update:page"],
  template: '<div class="list" />',
};

const CalendarStub = {
  name: "SalesRepTaskCalendar",
  props: ["modelValue", "month", "dayMarkers", "size"],
  emits: ["update:modelValue", "update:month"],
  template: '<div class="grid" />',
};

// Plain mount (not createWrapperFactory): this file mocks the vue-i18n module, and the shared factory's
// defaults build a real i18n plugin from it.
function createWrapper() {
  return mount(Calendar, {
    global: {
      renderStubDefaultSlot: false,
      stubs: {
        // The page fills three different VcWidget slots, including the plain default one in the aside.
        VcWidget: {
          template: '<div><slot name="header-container" /><slot name="default-container" /><slot /></div>',
        },
        VcTypography: { template: "<div><slot /></div>" },
        SalesRepRuleAlert: true,
        SalesRepRuleChips: ChipsStub,
        SalesRepTaskList: ListStub,
        SalesRepTaskCalendar: CalendarStub,
        VcEmptyView: true,
        VcIcon: true,
      },
      // Real buttons: the page's actions are genuine <button>s the tests click.
      components: { VcButton },
    },
  });
}

type WrapperType = ReturnType<typeof createWrapper>;

const emptyViews = (wrapper: WrapperType) => wrapper.findAll("vc-empty-view-stub");

function button(wrapper: WrapperType, key: string) {
  const found = wrapper.findAll("button").find((candidate) => candidate.text().includes(key));
  if (!found) {
    throw new Error(`No button for ${key}`);
  }
  return found;
}

/** The options the page handed useSalesRepTasks — where the day scope, the tab and the sort live. */
function taskOptions() {
  return state.useSalesRepTasks.mock.calls.at(-1)?.[0] as {
    period: { value: { from: string; to: string } | undefined };
    filter: { value: string | undefined };
    sort: string;
  };
}

/** The page owns the tab now, so a test picks one the way the chips do. */
async function pickTab(wrapper: WrapperType, name: string) {
  wrapper.getComponent(ChipsStub).vm.$emit("update:modelValue", name);
  await flushPromises();
}

beforeEach(() => {
  state.items.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.filter.value = undefined;
  state.page.value = 1;
  state.pages.value = 1;
  state.totalCount.value = 0;
  state.counts.value = { all: 0, upcoming: 0, overdue: 0, completed: 0 };
  state.rules.value = [];
  state.rulesFailed.value = false;
  state.month.value = "2026-10-01";
  dMock.mockClear();
  state.refetch.mockClear();
  state.refetchCounts.mockClear();
  state.refetchMarkers.mockClear();
  state.goToToday.mockClear();
  state.openModal.mockClear();
  state.setCompleted.mockClear().mockResolvedValue(true);
  state.useSalesRepTasks.mockClear();
  state.useSalesRepTasks.mockImplementation(() => ({
    items: state.items,
    loading: state.loading,
    error: state.error,
    filter: state.filter,
    page: state.page,
    pages: state.pages,
    totalCount: state.totalCount,
    refetch: state.refetch,
  }));
});

describe("Calendar tabs", () => {
  // The chips come from the server's filter rules; the counts query answers by the same rule names, so the two
  // are joined by name rather than by a hand-kept list.
  it("badges each server-offered tab with its own count", () => {
    state.rules.value = [
      { name: "upcoming", label: "Upcoming" },
      { name: "overdue", label: "Overdue" },
    ];
    state.counts.value = { all: 12, upcoming: 7, overdue: 3, completed: 2 };

    const wrapper = createWrapper();
    const chips = wrapper.getComponent(ChipsStub);

    expect(chips.props("rules")).toEqual([
      { name: "upcoming", label: "Upcoming", count: 7 },
      { name: "overdue", label: "Overdue", count: 3 },
    ]);
    expect(chips.props("allCount")).toBe(12);
  });

  it("offers no tabs at all when the rules could not be loaded", () => {
    state.rulesFailed.value = true;

    const wrapper = createWrapper();

    expect(wrapper.getComponent(ChipsStub).props("rules")).toEqual([]);
  });
});

describe("Calendar day scope", () => {
  it("opens on today", () => {
    createWrapper();

    expect(taskOptions().period.value).toEqual(localDayWindow(localDayKey(new Date())));
  });

  it("rescopes the list to the day the rep picked", async () => {
    const wrapper = createWrapper();

    wrapper.getComponent(CalendarStub).vm.$emit("update:modelValue", "2026-10-20");
    await flushPromises();

    expect(taskOptions().period.value).toEqual(localDayWindow("2026-10-20"));
  });

  // "long" appends a time to the named format; this heading names a DAY.
  it("heads the list with the day in the short format", () => {
    createWrapper();

    expect(dMock).toHaveBeenCalledWith(expect.any(Date), "short");
    expect(dMock.mock.calls.every(([, format]) => format !== "long")).toBe(true);
  });

  it("returns to today from wherever the rep browsed to", async () => {
    const wrapper = createWrapper();
    wrapper.getComponent(CalendarStub).vm.$emit("update:modelValue", "2026-10-20");
    await flushPromises();

    await button(wrapper, "tasks.today").trigger("click");

    // Both halves: the day the list is scoped to, and the month the grid shows.
    expect(taskOptions().period.value).toEqual(localDayWindow(localDayKey(new Date())));
    expect(state.goToToday).toHaveBeenCalled();
  });
});

/**
 * The day and the tab are two views of the same set, not two filters over it. Anding them put an active
 * "Completed 3" chip over an empty list, because the badges count the whole set while the list counted one day.
 */
describe("Calendar tab scope", () => {
  it("drops the day window while a status tab is active", async () => {
    const wrapper = createWrapper();

    await pickTab(wrapper, "overdue");

    expect(taskOptions().filter.value).toBe("overdue");
    // Overdue work is due in the past, so intersecting it with the day on screen would show nothing.
    expect(taskOptions().period.value).toBeUndefined();
  });

  it("returns to the day's full list when the rep picks a date", async () => {
    const wrapper = createWrapper();
    await pickTab(wrapper, "overdue");

    wrapper.getComponent(CalendarStub).vm.$emit("update:modelValue", "2026-10-20");
    await flushPromises();

    expect(taskOptions().filter.value).toBeUndefined();
    expect(taskOptions().period.value).toEqual(localDayWindow("2026-10-20"));
  });

  it("heads the panel with the tab's own label instead of the date", async () => {
    state.rules.value = [{ name: "overdue", label: "Overdue" }];
    const wrapper = createWrapper();

    await pickTab(wrapper, "overdue");

    expect(wrapper.get(".sales-rep-calendar__day-title").text()).toBe("Overdue");
  });

  // "Nothing due on this day" is wrong copy for a list that is not scoped to a day.
  it("explains an empty tab as an empty tab, not an empty day", async () => {
    const wrapper = createWrapper();

    await pickTab(wrapper, "completed");

    expect(emptyViews(wrapper)[0].attributes("text")).toBe("sales_rep.tasks.empty");
  });
});

describe("Calendar states", () => {
  it("lists the day's tasks", () => {
    state.items.value = [makeTask()];
    state.totalCount.value = 4;

    const wrapper = createWrapper();

    expect(wrapper.getComponent(ListStub).props("tasks")).toHaveLength(1);
    // The header counts the whole day, not the page.
    expect(wrapper.find(".sales-rep-calendar__day-count").text()).toContain('"total":4');
  });

  it("shows the empty-day view when nothing is due", () => {
    const wrapper = createWrapper();

    expect(emptyViews(wrapper)).toHaveLength(1);
    expect(emptyViews(wrapper)[0].attributes("variant")).toBe("empty");
    expect(wrapper.findComponent(ListStub).exists()).toBe(false);
  });

  // Apollo keeps the previous rows on a failed refetch, so the failure view has to win over them.
  it("replaces the rows with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [makeTask()];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();

    expect(wrapper.findComponent(ListStub).exists()).toBe(false);
    expect(emptyViews(wrapper)[0].attributes("variant")).toBe("error");
  });

  it("explains each dot colour in a legend", () => {
    const wrapper = createWrapper();

    expect(wrapper.findAll(".sales-rep-calendar__legend-item").map((item) => item.text())).toEqual([
      "sales_rep.tasks.legend.upcoming",
      "sales_rep.tasks.legend.overdue",
      "sales_rep.tasks.legend.completed",
    ]);
  });
});

describe("Calendar writes", () => {
  // Every surface reads the same records, so a write refreshes the list, the tab counts and the dots.
  it("completes a task and refreshes all three surfaces", async () => {
    state.items.value = [makeTask()];

    const wrapper = createWrapper();
    wrapper.getComponent(ListStub).vm.$emit("toggle", makeTask());
    await flushPromises();

    expect(state.setCompleted).toHaveBeenCalledWith("task-1", true);
    expect(state.refetch).toHaveBeenCalled();
    expect(state.refetchCounts).toHaveBeenCalled();
    expect(state.refetchMarkers).toHaveBeenCalled();
  });

  it("reopens a completed task", async () => {
    state.items.value = [makeTask({ status: "completed", isActive: false })];

    const wrapper = createWrapper();

    wrapper.getComponent(ListStub).vm.$emit("toggle", makeTask({ status: "completed", isActive: false }));
    await flushPromises();

    expect(state.setCompleted).toHaveBeenCalledWith("task-1", false);
  });

  it("leaves the surfaces alone when the write failed", async () => {
    state.setCompleted.mockResolvedValue(false);
    state.items.value = [makeTask()];

    const wrapper = createWrapper();
    wrapper.getComponent(ListStub).vm.$emit("toggle", makeTask());
    await flushPromises();

    expect(state.refetch).not.toHaveBeenCalled();
  });

  it("creates against the day on screen", async () => {
    const wrapper = createWrapper();
    wrapper.getComponent(CalendarStub).vm.$emit("update:modelValue", "2026-10-20");
    await flushPromises();

    await button(wrapper, "tasks.new_task").trigger("click");

    const call = state.openModal.mock.calls.at(-1)?.[0] as {
      component: unknown;
      props: { task?: SalesRepTaskType; defaultDay: string; onSaved: () => void };
    };
    expect(call.component).toBe(SalesRepTaskModal);
    expect(call.props.defaultDay).toBe("2026-10-20");
    expect(call.props.task).toBeUndefined();
  });

  it("edits the task the row asked for, and refreshes once it saved", async () => {
    state.items.value = [makeTask()];

    const wrapper = createWrapper();

    wrapper.getComponent(ListStub).vm.$emit("edit", makeTask());
    await flushPromises();

    const call = state.openModal.mock.calls.at(-1)?.[0] as {
      props: { task?: SalesRepTaskType; onSaved: () => Promise<void> };
    };
    expect(call.props.task?.id).toBe("task-1");

    await call.props.onSaved();

    expect(state.refetch).toHaveBeenCalled();
    expect(state.refetchCounts).toHaveBeenCalled();
    expect(state.refetchMarkers).toHaveBeenCalled();
  });

  // Otherwise "Task saved" lands over a list the task is not in, and it looks like the save was lost.
  it("follows a task saved onto another day", async () => {
    const wrapper = createWrapper();
    await pickTab(wrapper, "completed");

    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { onSaved: (day?: string) => Promise<void> } };

    await call.props.onSaved("2026-11-02");

    expect(taskOptions().period.value).toEqual(localDayWindow("2026-11-02"));
    // The tab goes with it: a status view would hide the task again.
    expect(taskOptions().filter.value).toBeUndefined();
  });

  /**
   * Apollo restarts a query whose variables changed by itself, and defers that to nextTick while refetch() runs
   * synchronously — so refetching a rescoped surface here would fire a second request carrying the variables the
   * move just replaced.
   */
  it("leaves the surfaces the move rescoped to apollo, and refreshes only the rest", async () => {
    const wrapper = createWrapper();

    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { onSaved: (day?: string) => Promise<void> } };

    // Another day AND another month than the "2026-10-01" the grid is anchored to.
    await call.props.onSaved("2026-11-02");

    expect(state.refetch).not.toHaveBeenCalled();
    expect(state.refetchMarkers).not.toHaveBeenCalled();
    // The counts carry neither a day nor a month, so nothing rescoped them.
    expect(state.refetchCounts).toHaveBeenCalled();
  });

  it("still refreshes the grid when the save stayed inside the month on screen", async () => {
    const wrapper = createWrapper();

    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { onSaved: (day?: string) => Promise<void> } };

    await call.props.onSaved("2026-10-20");

    expect(state.refetch).not.toHaveBeenCalled();
    expect(state.refetchMarkers).toHaveBeenCalled();
  });

  // A delete moves nothing, so every surface needs telling.
  it("refreshes all three surfaces when the save reported no day", async () => {
    const wrapper = createWrapper();
    wrapper.getComponent(CalendarStub).vm.$emit("update:modelValue", "2026-10-20");
    await flushPromises();

    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { onSaved: (day?: string) => Promise<void> } };

    await call.props.onSaved();

    expect(taskOptions().period.value).toEqual(localDayWindow("2026-10-20"));
    expect(state.refetch).toHaveBeenCalled();
    expect(state.refetchMarkers).toHaveBeenCalled();
  });
});
