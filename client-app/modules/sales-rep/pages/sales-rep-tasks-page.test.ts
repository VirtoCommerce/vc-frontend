import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SalesRepTaskModal from "../components/sales-rep-task-modal.vue";
import { localDayKey, localDayWindow } from "../tasks";
import TasksPage from "./sales-rep-tasks-page.vue";
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
    counts: ref({ today: 0, all: 0, upcoming: 0, overdue: 0, completed: 0 }),
    rules: ref<{ name: string; label: string }[]>([]),
    filterParam: ref(""),
    rulesFailed: ref(false),
    month: ref("2026-10-01"),
    setMonth: vi.fn(),
    useSalesRepTasks: vi.fn(),
    refetch: vi.fn(),
    refetchCounts: vi.fn(),
    refetchMarkers: vi.fn(),
    setCompleted: vi.fn(),
    openModal: vi.fn(),
  };
});

// useBreadcrumbs reads the current path to decide whether to prepend a catalog root; the page needs
// nothing else from the router.
vi.mock("vue-router", async () => {
  const actual = await vi.importActual<typeof import("vue-router")>("vue-router");
  return { ...actual, useRoute: () => ({ path: "/company/tasks" }) };
});
// The ?filter= deep link; a plain ref stands in for the route-backed writable computed.
vi.mock("@/core/composables/useRouteQueryParam", () => ({ useRouteQueryParam: () => state.filterParam }));
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
    useMonthAnchor: () => ({ month: state.month, setMonth: state.setMonth }),
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
    status: "upcoming",
    ...overrides,
  };
}

// Named stubs, so the tests can read what the page handed each child and emit back through it.
const BreadcrumbsStub = {
  name: "VcBreadcrumbs",
  props: ["items"],
  template: '<nav class="crumbs" />',
};

const ChipsStub = {
  name: "SalesRepRuleChips",
  props: ["modelValue", "rules", "loading"],
  // The page fills the baseline with its own Today / day / All chips.
  template: '<div class="chips"><slot name="baseline" /></div>',
};

const ScopeChipsStub = {
  name: "SalesRepTaskScopeChips",
  props: ["view", "dayLabel", "showDay", "counts"],
  emits: ["today", "day", "all", "clearDay"],
  template: '<div class="scope-chips" />',
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
  return mount(TasksPage, {
    global: {
      renderStubDefaultSlot: false,
      stubs: {
        // The page fills three different VcWidget slots, including the plain default one in the aside.
        VcWidget: {
          template: '<div><slot name="header-container" /><slot name="default-container" /><slot /></div>',
        },
        VcTypography: { template: "<div><slot /></div>" },
        VcBreadcrumbs: BreadcrumbsStub,
        SalesRepRuleAlert: true,
        SalesRepRuleChips: ChipsStub,
        SalesRepTaskScopeChips: ScopeChipsStub,
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
  state.filterParam.value = "";
  state.page.value = 1;
  state.pages.value = 1;
  state.totalCount.value = 0;
  state.counts.value = { today: 0, all: 0, upcoming: 0, overdue: 0, completed: 0 };
  state.rules.value = [];
  state.rulesFailed.value = false;
  state.month.value = "2026-10-01";
  state.setMonth.mockClear();
  dMock.mockClear();
  state.refetch.mockClear();
  state.refetchCounts.mockClear();
  state.refetchMarkers.mockClear();
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

describe("Tasks page tabs", () => {
  // The chips come from the server's filter rules; the counts query answers by the same rule names, so the two
  // are joined by name rather than by a hand-kept list.
  it("badges each server-offered tab with its own count", () => {
    state.rules.value = [
      { name: "upcoming", label: "Upcoming" },
      { name: "overdue", label: "Overdue" },
    ];
    state.counts.value = { today: 2, all: 12, upcoming: 7, overdue: 3, completed: 2 };

    const wrapper = createWrapper();
    const chips = wrapper.getComponent(ChipsStub);

    expect(chips.props("rules")).toEqual([
      { name: "upcoming", label: "Upcoming", count: 7 },
      { name: "overdue", label: "Overdue", count: 3 },
    ]);
  });

  it("badges the Today and All chips from the counts query", () => {
    state.counts.value = { today: 2, all: 12, upcoming: 7, overdue: 3, completed: 2 };

    const wrapper = createWrapper();

    expect(wrapper.getComponent(ScopeChipsStub).props("counts")).toEqual(state.counts.value);
  });

  // The dashboard's overdue notice arrives as ?filter=overdue, so the page must open on that tab rather
  // than on the day — the day it would open on is precisely the one that holds no overdue work (M-3).
  it("opens on the tab the URL asked for", () => {
    state.filterParam.value = "overdue";
    state.rules.value = [{ name: "overdue", label: "Overdue" }];

    const wrapper = createWrapper();

    expect(wrapper.getComponent(ChipsStub).props("modelValue")).toBe("overdue");
    // A tab spans every date, so the day window is dropped — same as picking the tab by hand.
    expect(state.useSalesRepTasks.mock.calls.at(-1)?.[0].period.value).toBeUndefined();
  });

  // Two-way: the URL keeps up with the chips, so a refresh lands back on the same view.
  it("writes the chosen tab to the URL, and clears it when the rep returns to a day", async () => {
    const wrapper = createWrapper();

    await pickTab(wrapper, "completed");
    expect(state.filterParam.value).toBe("completed");

    await wrapper.getComponent(CalendarStub).vm.$emit("update:modelValue", "2026-10-20");
    expect(state.filterParam.value).toBe("");
  });

  it("offers no tabs at all when the rules could not be loaded", () => {
    state.rulesFailed.value = true;

    const wrapper = createWrapper();

    expect(wrapper.getComponent(ChipsStub).props("rules")).toEqual([]);
  });
});

describe("Tasks page scope chips", () => {
  const scopeChips = (wrapper: WrapperType) => wrapper.getComponent(ScopeChipsStub);

  async function pickDay(wrapper: WrapperType, day: string) {
    wrapper.getComponent(CalendarStub).vm.$emit("update:modelValue", day);
    await flushPromises();
  }

  it("opens on Today, with no chip of its own for the day", () => {
    const wrapper = createWrapper();

    expect(scopeChips(wrapper).props()).toMatchObject({ view: "today", showDay: false });
  });

  // A day other than today gets a chip labelled with its date, so the row says which day the list shows.
  it("gives a picked day its own chip", async () => {
    const wrapper = createWrapper();

    await pickDay(wrapper, "2026-10-20");

    expect(scopeChips(wrapper).props()).toMatchObject({ view: "day", showDay: true, dayLabel: "Oct 15, 2026" });
  });

  // What the old header button did: the list, the tab and the grid's month all come back to today.
  it("returns to today from the Today chip, from a picked day and a tab", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");
    await pickTab(wrapper, "overdue");

    scopeChips(wrapper).vm.$emit("today");
    await flushPromises();

    const today = localDayKey(new Date());
    expect(state.filterParam.value).toBe("");
    expect(taskOptions().period.value).toEqual(localDayWindow(today));
    expect(state.setMonth).toHaveBeenCalledWith(today);
    // Only its × closes the date chip (VCST-6077 mockup).
    expect(scopeChips(wrapper).props()).toMatchObject({ view: "today", showDay: true });
  });

  it("keeps the date chip when today is picked in the calendar", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");

    await pickDay(wrapper, localDayKey(new Date()));

    expect(scopeChips(wrapper).props()).toMatchObject({ view: "today", showDay: true });
  });

  it("moves the date chip to the latest day picked", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");
    await pickDay(wrapper, "2026-10-22");

    expect(dMock).toHaveBeenLastCalledWith(new Date("2026-10-22T00:00:00"), "short");
    expect(taskOptions().period.value).toEqual(localDayWindow("2026-10-22"));
  });

  // Closing the chip while Today is on changes nothing else.
  it("closes the date chip from Today without leaving Today", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");
    scopeChips(wrapper).vm.$emit("today");
    await flushPromises();
    state.setMonth.mockClear();

    scopeChips(wrapper).vm.$emit("clearDay");
    await flushPromises();

    expect(scopeChips(wrapper).props()).toMatchObject({ view: "today", showDay: false });
    expect(state.setMonth).not.toHaveBeenCalled();
  });

  it("clears a picked day back to today from its chip", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");

    scopeChips(wrapper).vm.$emit("clearDay");
    await flushPromises();

    const today = localDayKey(new Date());
    expect(taskOptions().period.value).toEqual(localDayWindow(today));
    expect(state.setMonth).toHaveBeenLastCalledWith(today);
    expect(scopeChips(wrapper).props()).toMatchObject({ view: "today", showDay: false });
  });

  // The day's chip stays while a tab is on, so the rep can get back to that day; clearing it leaves the tab alone,
  // and the month the rep paged the grid to under it.
  it("keeps the picked day's chip under a tab, and clears it without dropping the tab", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");
    await pickTab(wrapper, "overdue");
    state.setMonth.mockClear();

    expect(scopeChips(wrapper).props()).toMatchObject({ view: undefined, showDay: true });

    scopeChips(wrapper).vm.$emit("clearDay");
    await flushPromises();

    expect(state.filterParam.value).toBe("overdue");
    expect(scopeChips(wrapper).props()).toMatchObject({ view: undefined, showDay: false });
    expect(state.setMonth).not.toHaveBeenCalled();

    // The cleared day is not left behind as the new task's default either.
    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { defaultDay: string } };
    expect(call.props.defaultDay).toBe(localDayKey(new Date()));
  });

  it("clears the picked day under All without leaving All or moving the grid", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");
    scopeChips(wrapper).vm.$emit("all");
    await flushPromises();
    state.setMonth.mockClear();

    scopeChips(wrapper).vm.$emit("clearDay");
    await flushPromises();

    expect(scopeChips(wrapper).props()).toMatchObject({ view: "all", showDay: false });
    expect(state.setMonth).not.toHaveBeenCalled();
  });

  it("goes back to the picked day from its chip", async () => {
    const wrapper = createWrapper();
    await pickDay(wrapper, "2026-10-20");
    await pickTab(wrapper, "overdue");

    scopeChips(wrapper).vm.$emit("day");
    await flushPromises();

    expect(state.filterParam.value).toBe("");
    expect(taskOptions().period.value).toEqual(localDayWindow("2026-10-20"));
    expect(state.setMonth).toHaveBeenLastCalledWith("2026-10-20");
  });

  // Every task: no day window and no rule, so the list and the All badge count the same set.
  it("lists every task under All", async () => {
    const wrapper = createWrapper();

    scopeChips(wrapper).vm.$emit("all");
    await flushPromises();

    expect(taskOptions().period.value).toBeUndefined();
    expect(taskOptions().filter.value).toBeUndefined();
    expect(scopeChips(wrapper).props("view")).toBe("all");
    expect(wrapper.get(".sales-rep-tasks-page__day-title").text()).toBe("sales_rep.tasks.all");
    // Not day-scoped, so no day is highlighted.
    expect(wrapper.getComponent(CalendarStub).props("modelValue")).toBeUndefined();
  });

  // All spans every rule as well as every date, so it replaces a status tab — and its `?filter=` — rather than
  // narrowing to it.
  it("drops the status tab for All", async () => {
    const wrapper = createWrapper();
    await pickTab(wrapper, "overdue");

    scopeChips(wrapper).vm.$emit("all");
    await flushPromises();

    expect(state.filterParam.value).toBe("");
    expect(taskOptions().filter.value).toBeUndefined();
    expect(scopeChips(wrapper).props("view")).toBe("all");
  });

  it("leaves All for the day picked in the calendar", async () => {
    const wrapper = createWrapper();
    scopeChips(wrapper).vm.$emit("all");
    await flushPromises();

    await pickDay(wrapper, "2026-10-20");

    expect(scopeChips(wrapper).props("view")).toBe("day");
    expect(taskOptions().period.value).toEqual(localDayWindow("2026-10-20"));
  });
});

describe("Tasks page day scope", () => {
  // The page sat at the top of the hub with no trail back (QA A-20). Home is the composable's own.
  it("places itself in the account trail", () => {
    const wrapper = createWrapper();

    const titles = (wrapper.getComponent(BreadcrumbsStub).props("items") as { title: string }[]).map(
      (crumb) => crumb.title,
    );

    expect(titles).toEqual([
      "common.links.home",
      "common.links.account",
      "sales_rep.hub.title",
      "sales_rep.tasks.title",
    ]);
  });

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
  // Picking a day or a tab replaces the list with no announcement at all (QA A-9); the heading names the
  // scope, so it is the thing to announce, atomically so the date and the count are read as one.
  it("announces the scope when it changes", () => {
    const wrapper = createWrapper();

    const live = wrapper.find('[aria-live="polite"]');
    expect(live.exists()).toBe(true);
    expect(live.attributes("aria-atomic")).toBe("true");
    expect(live.find(".sales-rep-tasks-page__day-count").exists()).toBe(true);
  });

  it("heads the list with the day in the short format", () => {
    createWrapper();

    expect(dMock).toHaveBeenCalledWith(expect.any(Date), "short");
    expect(dMock.mock.calls.every(([, format]) => format !== "long")).toBe(true);
  });
});

/**
 * The day and the tab are two views of the same set, not two filters over it. Anding them put an active
 * "Completed 3" chip over an empty list, because the badges count the whole set while the list counted one day.
 */
describe("Tasks page tab scope", () => {
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

    expect(wrapper.get(".sales-rep-tasks-page__day-title").text()).toBe("Overdue");
  });

  // "Nothing due on this day" is wrong copy for a list that is not scoped to a day.
  it("explains an empty tab as an empty tab, not an empty day", async () => {
    const wrapper = createWrapper();

    await pickTab(wrapper, "completed");

    expect(emptyViews(wrapper)[0].attributes("text")).toBe("sales_rep.tasks.empty");
  });
});

describe("Tasks page states", () => {
  it("lists the day's tasks", () => {
    state.items.value = [makeTask()];
    state.totalCount.value = 4;

    const wrapper = createWrapper();

    expect(wrapper.getComponent(ListStub).props("tasks")).toHaveLength(1);
    // The header counts the whole day, not the page the pager is on.
    const count = wrapper.find(".sales-rep-tasks-page__day-count").text();
    expect(count).toContain("sales_rep.tasks.day_task_count");
    expect(count).toContain('"count":4');
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

    expect(wrapper.findAll(".sales-rep-tasks-page__legend-item").map((item) => item.text())).toEqual([
      "sales_rep.tasks.legend.upcoming",
      "sales_rep.tasks.legend.overdue",
      "sales_rep.tasks.legend.completed",
    ]);
  });

  // The rail is sized for the `sm` grid (VCST-6077); at `md` it would spill past the widget.
  it("draws the month rail's calendar at sm", () => {
    const wrapper = createWrapper();

    expect(wrapper.getComponent(CalendarStub).props("size")).toBe("sm");
  });

  it("names the month rail after its own heading", () => {
    const wrapper = createWrapper();
    const titleId = wrapper.get("aside").attributes("aria-labelledby");

    expect(titleId).toBeTruthy();
    expect(wrapper.get(`[id="${titleId}"]`).text()).toBe("sales_rep.tasks.due_dates");
  });
});

describe("Tasks page writes", () => {
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

  // A failed toggle usually means the row is stale — deleted from another tab — so the surfaces refresh anyway
  // and the phantom row goes away. useMutation has already raised the error toast.
  it("still refreshes when the write failed, so a stale row cannot linger", async () => {
    state.setCompleted.mockResolvedValue(false);
    state.items.value = [makeTask()];

    const wrapper = createWrapper();
    wrapper.getComponent(ListStub).vm.$emit("toggle", makeTask());
    await flushPromises();

    expect(state.refetch).toHaveBeenCalled();
    expect(state.refetchCounts).toHaveBeenCalled();
    expect(state.refetchMarkers).toHaveBeenCalled();
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

    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { onSaved: (day?: string) => Promise<void> } };

    await call.props.onSaved("2026-11-02");

    expect(taskOptions().period.value).toEqual(localDayWindow("2026-11-02"));
  });

  // A status tab spans every date, so a task that moved is in or out of it on its own merits. Following the
  // day would throw away the tab the rep chose — and the `?filter=` in the URL with it.
  it("keeps an active tab across a save, rather than jumping to the task's day", async () => {
    const wrapper = createWrapper();
    await pickTab(wrapper, "completed");

    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { onSaved: (day?: string) => Promise<void> } };

    await call.props.onSaved("2026-11-02");

    expect(taskOptions().filter.value).toBe("completed");
    expect(state.filterParam.value).toBe("completed");
    // Nothing rescoped, so apollo restarts nothing and every surface still needs telling.
    expect(state.refetch).toHaveBeenCalled();
    expect(state.refetchCounts).toHaveBeenCalled();
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
    // The counts key off no day, so nothing restarts them: a task saved onto another day still has to reach
    // the All and status badges.
    expect(state.refetchCounts).toHaveBeenCalled();
  });

  it("still refreshes the counts when the save stayed on the day on screen", async () => {
    const wrapper = createWrapper();

    await button(wrapper, "tasks.new_task").trigger("click");
    const call = state.openModal.mock.calls.at(-1)?.[0] as { props: { onSaved: (day?: string) => Promise<void> } };

    await call.props.onSaved(localDayKey(new Date()));

    expect(state.refetchCounts).toHaveBeenCalled();
    expect(state.refetch).toHaveBeenCalled();
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
