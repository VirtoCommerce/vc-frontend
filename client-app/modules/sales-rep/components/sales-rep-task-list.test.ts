import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, inject, provide } from "vue";
import SalesRepTaskList from "./sales-rep-task-list.vue";
import type { SalesRepTaskType } from "../types/tasks";
import type { ComputedRef, InjectionKey } from "vue";

// Keys, not prose: the assertions are about which branch rendered.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
    d: () => "Oct 15",
  }),
}));

function makeTask(overrides: Partial<SalesRepTaskType> = {}): SalesRepTaskType {
  return {
    id: "task-1",
    name: "Call ACME",
    description: "Discuss renewal",
    type: "Finance",
    priority: "Normal",
    dueDate: "2026-10-15T00:00:00Z",
    isActive: true,
    completed: undefined,
    status: "upcoming",
    ...overrides,
  };
}

/**
 * VcTable renders each column's cell template per row itself, so the stubs reproduce just that: a header pass (no
 * row → the column prints its title), then one desktop row per item (the column renders its default slot with that
 * item), then the mobile card per item. Both layouts carry their own copy of the title and the action, so every
 * row-level case below runs against each.
 */
const ROW: InjectionKey<ComputedRef<SalesRepTaskType>> = Symbol("row");

const RowStub = defineComponent({
  props: { item: { type: Object, required: true } },

  setup(props, { slots }) {
    provide(
      ROW,
      computed(() => props.item as SalesRepTaskType),
    );
    return () => slots.default?.();
  },
});

const VcTableStub = defineComponent({
  props: { items: { type: Array, default: () => [] } },

  setup(props, { slots }) {
    return () =>
      h("div", [
        h("div", { class: "head" }, slots.default?.()),
        ...(props.items as SalesRepTaskType[]).map((item) =>
          h("div", { class: "desktop-row", key: `d-${item.id}` }, [h(RowStub, { item }, () => slots.default?.())]),
        ),
        ...(props.items as SalesRepTaskType[]).map((item) =>
          h("div", { class: "mobile-row", key: `m-${item.id}` }, slots["mobile-item"]?.({ item })),
        ),
      ]);
  },
});

const VcTableColumnStub = defineComponent({
  props: { id: { type: String, required: true }, title: { type: String, default: "" } },

  setup(props, { slots }) {
    const row = inject(ROW, null);
    return () =>
      row
        ? h("div", { class: "cell", "data-id": props.id }, slots.default?.({ item: row.value }))
        : h("span", { class: "col", "data-id": props.id }, props.title);
  },
});

function createWrapper(tasks: SalesRepTaskType[], busy = false) {
  return mount(SalesRepTaskList, {
    props: { tasks, busy },
    global: {
      stubs: {
        VcTable: VcTableStub,
        VcTableColumn: VcTableColumnStub,
        SalesRepTaskStatus: true,
        SalesRepTaskAction: {
          props: ["task", "disabled"],
          emits: ["toggle"],
          template: '<button class="action" :disabled="disabled" @click="$emit(\'toggle\')" />',
        },
      },
    },
  });
}

const LAYOUTS = [
  ["desktop", ".desktop-row"],
  ["mobile", ".mobile-row"],
] as const;

describe("SalesRepTaskList", () => {
  // The checkbox column went with VCST-6077: completion is the row action at the end now.
  it("lays out Task, Status, Notes and Actions", () => {
    const wrapper = createWrapper([makeTask()]);

    expect(wrapper.findAll(".col").map((column) => column.attributes("data-id"))).toEqual([
      "task",
      "status",
      "notes",
      "actions",
    ]);
    expect(wrapper.find(".col[data-id='actions']").text()).toBe("sales_rep.tasks.table.actions");
  });

  it("puts the action in the Actions cell on desktop", () => {
    const wrapper = createWrapper([makeTask()]);

    expect(wrapper.find(".desktop-row .cell[data-id='actions'] .action").exists()).toBe(true);
  });

  describe.each(LAYOUTS)("%s", (_layout, rowSelector) => {
    const rows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll(rowSelector);

    it("strikes through a completed task's title only", () => {
      const wrapper = createWrapper([makeTask(), makeTask({ id: "task-2", status: "completed", isActive: false })]);

      const titles = rows(wrapper).map((row) => row.find(".sales-rep-task-list__title-button"));

      expect(titles[0].classes()).not.toContain("sales-rep-task-list__title-button--completed");
      expect(titles[1].classes()).toContain("sales-rep-task-list__title-button--completed");
    });

    it("opens the editor from the title", async () => {
      const task = makeTask();
      const wrapper = createWrapper([task]);

      await rows(wrapper)[0].find(".sales-rep-task-list__title-button").trigger("click");

      expect(wrapper.emitted("edit")).toEqual([[task]]);
    });

    it("toggles the row's own task from its action", async () => {
      const second = makeTask({ id: "task-2", name: "Send quote" });
      const wrapper = createWrapper([makeTask(), second]);

      await rows(wrapper)[1].find(".action").trigger("click");

      expect(wrapper.emitted("toggle")).toEqual([[second]]);
    });

    it("holds the actions still while a write is in flight", () => {
      const wrapper = createWrapper([makeTask()], true);

      expect(rows(wrapper)[0].find(".action").attributes("disabled")).toBeDefined();
    });
  });
});
