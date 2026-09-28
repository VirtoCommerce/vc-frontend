import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import SalesRepTaskScopeChips from "./sales-rep-task-scope-chips.vue";
import type { SalesRepTaskScopeType } from "../types/tasks";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
  }),
}));

type PropsType = { view?: SalesRepTaskScopeType; showDay?: boolean };

/**
 * Mounted inside a single-root host, as the chips row renders it: the component is multi-root, and VTU's findAll on a
 * fragment lists matching roots before nested matches, which would scramble the chip order under test.
 */
function createWrapper(options: PropsType = {}) {
  // `in`, not a default: an explicit undefined view (a status tab is on) must stay undefined.
  const view = "view" in options ? options.view : "today";
  const Host = defineComponent({
    setup: () => () =>
      h("div", [
        h(SalesRepTaskScopeChips, {
          view,
          showDay: options.showDay ?? false,
          dayLabel: "Oct 20, 2026",
          counts: { today: 3, all: 12 },
        }),
      ]),
  });

  return mount(Host, {
    global: {
      stubs: {
        VcTabSwitch: {
          props: ["value", "modelValue"],
          emits: ["change"],
          template:
            '<label class="tab" :data-value="value" :data-checked="String(value === modelValue)"><button class="tab-button" type="button" @click="$emit(\'change\', value)"><slot /></button></label>',
        },
        VcIcon: true,
      },
    },
  });
}

type WrapperType = ReturnType<typeof createWrapper>;

const chips = (wrapper: WrapperType) => wrapper.getComponent(SalesRepTaskScopeChips);
const tabs = (wrapper: WrapperType) => wrapper.findAll(".tab");
const tab = (wrapper: WrapperType, value: string) => wrapper.get(`.tab[data-value="${value}"]`);

describe("SalesRepTaskScopeChips", () => {
  it("offers Today and All, with no day chip while today is the picked day", () => {
    const wrapper = createWrapper();

    expect(tabs(wrapper).map((chip) => chip.attributes("data-value"))).toEqual(["today", "all"]);
    expect(tab(wrapper, "today").text()).toBe("sales_rep.tasks.today3");
    expect(tab(wrapper, "all").text()).toBe("sales_rep.tasks.all12");
  });

  it("puts a picked day's chip, named by its date and with no badge, ahead of Today", () => {
    const wrapper = createWrapper({ view: "day", showDay: true });

    expect(tabs(wrapper).map((chip) => chip.attributes("data-value"))).toEqual(["day", "today", "all"]);
    expect(tab(wrapper, "day").text()).toBe("Oct 20, 2026");
  });

  it.each(["today", "day", "all"] as const)("marks %s as the chip on screen", (view) => {
    const wrapper = createWrapper({ view, showDay: true });

    expect(tabs(wrapper).map((chip) => chip.attributes("data-checked"))).toEqual(
      ["day", "today", "all"].map((value) => String(value === view)),
    );
  });

  // A status tab has taken over: none of these is on, but the picked day's chip stays to get back to it.
  it("marks none while a status tab is on", () => {
    const wrapper = createWrapper({ view: undefined, showDay: true });

    expect(tabs(wrapper).map((chip) => chip.attributes("data-checked"))).toEqual(["false", "false", "false"]);
  });

  it.each(["today", "day", "all"] as const)("emits %s from its chip", async (value) => {
    const wrapper = createWrapper({ showDay: true });

    await tab(wrapper, value).get(".tab-button").trigger("click");

    expect(chips(wrapper).emitted(value)).toHaveLength(1);
  });

  // A sibling of the tab, not inside it: the tab's content is already a <button>.
  it("clears the picked day from its own button, named with the date", async () => {
    const wrapper = createWrapper({ view: "day", showDay: true });
    const clear = wrapper.get(".sales-rep-task-scope-chips__clear");

    expect(clear.element.closest(".tab")).toBeNull();
    expect(clear.attributes("aria-label")).toBe(
      `sales_rep.tasks.clear_day_aria ${JSON.stringify({ date: "Oct 20, 2026" })}`,
    );

    await clear.trigger("click");

    expect(chips(wrapper).emitted("clearDay")).toHaveLength(1);
    expect(chips(wrapper).emitted("day")).toBeUndefined();
  });
});
