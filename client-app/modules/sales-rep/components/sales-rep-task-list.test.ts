import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import SalesRepTaskList from "./sales-rep-task-list.vue";
import type { SalesRepTaskType } from "../types/tasks";

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

function createWrapper(tasks: SalesRepTaskType[], busy = false) {
  return mount(SalesRepTaskList, {
    props: { tasks, busy },
    global: {
      stubs: {
        // Renders what the table is handed: the column headers, and the per-row card the mobile layout draws —
        // which carries the same title and action wiring as the desktop cells.
        VcTable: {
          props: ["items"],
          template:
            '<div><div class="head"><slot /></div><div v-for="item in items" :key="item.id" class="row"><slot name="mobile-item" :item="item" /></div></div>',
        },
        VcTableColumn: { props: ["id", "title"], template: '<span class="col" :data-id="id">{{ title }}</span>' },
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

const rows = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll(".row");

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

  it("strikes through a completed task's title only", () => {
    const wrapper = createWrapper([makeTask(), makeTask({ id: "task-2", status: "completed", isActive: false })]);

    const titles = rows(wrapper).map((row) => row.find(".sales-rep-task-list__title-button"));

    expect(titles[0].classes()).not.toContain("sales-rep-task-list__title-button--completed");
    expect(titles[1].classes()).toContain("sales-rep-task-list__title-button--completed");
  });

  it("opens the editor from the title", async () => {
    const task = makeTask();
    const wrapper = createWrapper([task]);

    await wrapper.find(".sales-rep-task-list__title-button").trigger("click");

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

    expect(wrapper.find(".action").attributes("disabled")).toBeDefined();
  });
});
