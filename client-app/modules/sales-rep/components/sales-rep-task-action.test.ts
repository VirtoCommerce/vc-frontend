import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import SalesRepTaskAction from "./sales-rep-task-action.vue";
import type { SalesRepTaskStatusType, SalesRepTaskType } from "../types/tasks";

// Keys, not prose: the assertions are about which action rendered, and the params it composed.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
  }),
}));

function makeTask(status: SalesRepTaskStatusType): SalesRepTaskType {
  return {
    id: "task-1",
    name: "Call ACME",
    description: "",
    type: "Finance",
    priority: "Normal",
    dueDate: "2026-10-15T00:00:00Z",
    isActive: status === "upcoming" || status === "overdue",
    completed: status === "completed" ? true : undefined,
    status,
  };
}

function createWrapper(status: SalesRepTaskStatusType, disabled = false) {
  return mount(SalesRepTaskAction, {
    props: { task: makeTask(status), disabled },
    global: {
      stubs: {
        VcButton: {
          props: ["disabled"],
          emits: ["click"],
          template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot name="prepend" /><slot /></button>',
        },
        VcIcon: { props: ["name", "color"], template: '<i :data-name="name" :data-color="color" />' },
      },
    },
  });
}

describe("SalesRepTaskAction", () => {
  it.each(["upcoming", "overdue"] as const)("offers to complete an %s task", (status) => {
    const wrapper = createWrapper(status);

    expect(wrapper.text()).toBe("sales_rep.tasks.table.mark_complete");
    expect(wrapper.find("i").attributes()).toMatchObject({ "data-name": "circle-check-big", "data-color": "success" });
  });

  it("offers to reopen a completed task", () => {
    const wrapper = createWrapper("completed");

    expect(wrapper.text()).toBe("sales_rep.tasks.table.reopen");
    expect(wrapper.find("i").attributes()).toMatchObject({ "data-name": "rotate-ccw", "data-color": "info" });
  });

  // Closed in the admin app without being done: neither completing nor reopening describes undoing that.
  it("offers nothing on a canceled task", () => {
    const wrapper = createWrapper("canceled");

    expect(wrapper.find("button").exists()).toBe(false);
  });

  // The visible label repeats on every row, so the name adds the task — led by the label (WCAG 2.5.3).
  it("names the task after the visible label", () => {
    const wrapper = createWrapper("completed");

    expect(wrapper.find("button").attributes("aria-label")).toBe(
      `sales_rep.tasks.table.action_aria ${JSON.stringify({ action: "sales_rep.tasks.table.reopen", name: "Call ACME" })}`,
    );
  });

  it("emits toggle on click", async () => {
    const wrapper = createWrapper("upcoming");

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("holds still while a write is in flight", () => {
    const wrapper = createWrapper("upcoming", true);

    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    // No colour of its own, so the glyph greys with the disabled button rather than staying lit.
    expect(wrapper.find("i").attributes("data-color")).toBeUndefined();
  });
});
