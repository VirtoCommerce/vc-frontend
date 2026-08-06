import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import DashboardWidgets from "./dashboard-widgets.vue";
import type { StatWidgetCardType } from "../types/widgets";

// The wrapper's only job is to map each card's own loading/failed onto <StatWidget>. That mapping is
// the seam VCST-5586 introduced, and nothing else exercises it.
const cards = ref<StatWidgetCardType[]>([]);

vi.mock("../composables/useSalesRepDashboardWidgets", () => ({
  useSalesRepDashboardWidgets: () => ({ cards }),
}));

const card = (overrides: Partial<StatWidgetCardType> = {}): StatWidgetCardType => ({
  key: "new_orders",
  labelKey: "label.new_orders",
  icon: "cart",
  value: "1,234",
  ...overrides,
});

const createWrapper = createWrapperFactory(mount, DashboardWidgets, {
  global: { stubs: { VcIcon: true, VcLoaderOverlay: true } },
});

describe("DashboardWidgets", () => {
  it("gives each card its own loading and error state rather than one for the row", () => {
    cards.value = [
      card({ key: "ok", value: "1,234" }),
      card({ key: "pending", value: "0", loading: true }),
      card({ key: "broken", value: "0", failed: true }),
    ];

    const wrapper = createWrapper();
    const rendered = wrapper.findAll(".stat-widget");

    expect(rendered).toHaveLength(3);
    // The healthy card keeps its figure while a sibling is pending and another has failed.
    expect(rendered[0].find(".stat-widget__value").text()).toBe("1,234");
    expect(rendered[0].find(".stat-widget__error").exists()).toBe(false);

    expect(rendered[1].find(".stat-widget__value--pending").exists()).toBe(true);
    expect(rendered[1].attributes("aria-busy")).toBe("true");

    expect(rendered[2].find(".stat-widget__error").exists()).toBe(true);
    expect(rendered[2].find(".stat-widget__value").exists()).toBe(false);
    // A failed card must not be announced as still loading.
    expect(rendered[2].attributes("aria-busy")).toBeUndefined();
  });

  it("renders no error text for a card that did not fail", () => {
    cards.value = [card({ key: "ok" })];

    const wrapper = createWrapper();

    expect(wrapper.find(".stat-widget__error").exists()).toBe(false);
    expect(wrapper.find(".stat-widget__value").text()).toBe("1,234");
  });
});
