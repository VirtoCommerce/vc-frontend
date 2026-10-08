import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import SalesRepTaskStatus from "./sales-rep-task-status.vue";
import type { SalesRepTaskStatusType } from "../types/tasks";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

function createWrapper(status: SalesRepTaskStatusType) {
  return mount(SalesRepTaskStatus, {
    props: { status },
    global: {
      stubs: {
        VcChip: {
          props: ["color", "variant"],
          template: '<span class="chip" :data-color="color" :data-variant="variant"><slot /></span>',
        },
        VcIcon: { props: ["name", "variant"], template: '<i :data-name="name" :data-variant="variant" />' },
      },
    },
  });
}

// The Orders recipe: semantic colour + variant + a leading glyph, one order state per task state.
describe("SalesRepTaskStatus", () => {
  it.each([
    ["upcoming", "info", "outline", "process"],
    ["overdue", "danger", "tonal", "circle-solid"],
    ["completed", "success", "tonal", "circle-solid"],
    ["canceled", "neutral", "tonal", "circle-solid"],
  ] as const)("renders %s as %s / %s with %s", (status, color, variant, icon) => {
    const wrapper = createWrapper(status);

    expect(wrapper.find(".chip").attributes()).toMatchObject({ "data-color": color, "data-variant": variant });
    expect(wrapper.find("i").attributes()).toMatchObject({ "data-name": icon, "data-variant": "solid" });
    expect(wrapper.text()).toBe(`sales_rep.tasks.status.${status}`);
  });
});
