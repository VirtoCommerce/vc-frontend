import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CALENDAR_ROUTE_NAME, TASKS_DEFAULT_ROWS } from "../constants";
import SalesRepTasks from "./sales-rep-tasks.vue";
import type { SalesRepTaskType } from "../types/tasks";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<SalesRepTaskType[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    totalCount: ref(0),
    useSalesRepTasks: vi.fn(),
  };
});

vi.mock("../composables/useSalesRepTasks", () => ({ useSalesRepTasks: state.useSalesRepTasks }));
vi.mock("../composables/useSalesRepTaskCalendar", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepTaskCalendar: () => ({ dayMarkers: ref({}) }),
    useMonthAnchor: () => ({ month: ref("2026-10-01"), setMonth: vi.fn() }),
  };
});
// Keys, not prose: the assertions are about which branch rendered, and the params it composed.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
    d: () => "Oct 15",
    n: (value: number) => String(value),
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

// Plain mount (not createWrapperFactory): this file mocks the vue-i18n module, and the shared factory's
// defaults build a real i18n plugin from it.
function createWrapper() {
  return mount(SalesRepTasks, {
    global: {
      renderStubDefaultSlot: false,
      stubs: {
        // The content lives in named slots, which a plain stub would not render.
        VcWidget: { template: '<div><slot name="append" /><slot name="default-container" /></div>' },
        // Covered by its own test; here it would only pull reka's grid into every assertion.
        SalesRepTaskCalendar: true,
        // Kept real so the status pill's own mapping is exercised; only its chip is stubbed.
        VcChip: { props: ["color", "variant"], template: '<span class="chip" :data-color="color"><slot /></span>' },
        VcLink: { props: ["to"], template: '<a :data-route="to.name"><slot /></a>' },
        VcEmptyView: true,
        VcIcon: true,
        VcButton: true,
      },
    },
  });
}

const rows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll(".sales-rep-tasks__row");
const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

beforeEach(() => {
  state.items.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.totalCount.value = 0;
  state.useSalesRepTasks.mockClear();
  state.useSalesRepTasks.mockImplementation(() => ({
    items: state.items,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
  }));
});

describe("SalesRepTasks rows", () => {
  it("renders a row per task with its status pill and accent", () => {
    state.items.value = [makeTask(), makeTask({ id: "task-2", name: "Send quote", status: "overdue" })];

    const wrapper = createWrapper();

    expect(rows(wrapper)).toHaveLength(2);
    expect(rows(wrapper)[0].find(".sales-rep-tasks__name").text()).toBe("Call ACME about the renewal");
    expect(rows(wrapper)[0].classes()).toContain("sales-rep-tasks__row--upcoming");
    expect(rows(wrapper)[1].classes()).toContain("sales-rep-tasks__row--overdue");
    expect(rows(wrapper)[1].find(".chip").attributes("data-color")).toBe("danger");
  });

  // The sub-line says whatever is most useful about the deadline, and falls back to the task's type.
  it("reads the deadline for an open task and the type once it no longer matters", () => {
    state.items.value = [
      makeTask({ status: "upcoming" }),
      makeTask({ id: "task-2", status: "overdue" }),
      makeTask({ id: "task-3", status: "completed" }),
      makeTask({ id: "task-4", status: "upcoming", dueDate: undefined }),
    ];

    const wrapper = createWrapper();
    const meta = rows(wrapper).map((row) => row.find(".sales-rep-tasks__meta").text());

    expect(meta[0]).toContain("sales_rep.tasks.due_relative.due");
    expect(meta[1]).toContain("sales_rep.tasks.due_relative.expired");
    // Done: when it was due stops being the interesting fact.
    expect(meta[2]).toBe("Finance");
    // Only the admin app can make a dateless task; it still has to read as something.
    expect(meta[3]).toBe("Finance");
  });

  // The header counts everything due that day, not just the rows the cap let through.
  it("counts the whole day, not the page", () => {
    state.items.value = [makeTask()];
    state.totalCount.value = 9;

    const wrapper = createWrapper();

    expect(wrapper.find(".sales-rep-tasks__day-count").text()).toContain('"count":9');
  });
});

describe("SalesRepTasks states", () => {
  it("shows the empty-day view when nothing is due", () => {
    const wrapper = createWrapper();

    expect(emptyViews(wrapper)).toHaveLength(1);
    expect(emptyViews(wrapper)[0].attributes("variant")).toBeUndefined();
  });

  // Apollo keeps the previous rows on a failed refetch, so the failure view has to win over them.
  it("replaces the rows with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [makeTask()];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();

    expect(rows(wrapper)).toHaveLength(0);
    expect(emptyViews(wrapper)[0].attributes("variant")).toBe("error");
  });

  it("holds the row count steady with a skeleton on the first load", () => {
    state.loading.value = true;

    const wrapper = createWrapper();
    const skeleton = wrapper.get(".sales-rep-tasks__list");

    expect(skeleton.attributes("aria-hidden")).toBe("true");
    expect(skeleton.findAll(".sales-rep-tasks__skeleton")).toHaveLength(TASKS_DEFAULT_ROWS);
    expect(emptyViews(wrapper)).toHaveLength(0);
  });

  // A refetch keeps the rows on screen; only a first load has nothing to show.
  it("keeps stale rows visible while reloading", () => {
    state.items.value = [makeTask()];
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(rows(wrapper)).toHaveLength(1);
    expect(wrapper.find(".sales-rep-tasks__skeleton").exists()).toBe(false);
  });
});

describe("SalesRepTasks wiring", () => {
  it("asks for the default row cap when rendered outside a layout", () => {
    createWrapper();

    const options = state.useSalesRepTasks.mock.calls.at(-1)?.[0] as { pageSize: () => number | undefined };
    expect(options.pageSize()).toBe(TASKS_DEFAULT_ROWS);
  });

  // The widget shows one day; the page is the all-tasks list.
  it("links through to the calendar page", () => {
    const wrapper = createWrapper();

    expect(wrapper.get(".sales-rep-tasks__all-link").attributes("data-route")).toBe(CALENDAR_ROUTE_NAME);
  });
});
