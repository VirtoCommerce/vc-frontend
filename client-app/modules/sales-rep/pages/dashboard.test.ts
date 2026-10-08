import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import Dashboard from "./dashboard.vue";
import LayoutSurface from "@/shared/dashboard/components/layout-surface.vue";

const useLayout = vi.hoisted(() => vi.fn(() => ({ scope: "salesRepDashboard" })));
vi.mock("@/shared/dashboard/composables/useLayout", () => ({ useLayout }));
vi.mock("../composables/useSalesRepDashboardWidgets", async () => {
  const { ref } = await import("vue");
  return { useSalesRepDashboardWidgets: vi.fn(() => ({ cards: ref([]) })) };
});

const createWrapper = createWrapperFactory(mount, Dashboard, {
  global: { stubs: { VcTypography: true, LayoutSurface: true } },
});

describe("Sales Rep dashboard page", () => {
  // The scope names the stored document: another one would show the hub a different arrangement, or an empty one.
  it("drives the hub's own saved layout", () => {
    createWrapper();

    expect(useLayout).toHaveBeenCalledWith("salesRepDashboard");
  });

  // One controller for both, so the surface and the statistics queries can never disagree on what is shown.
  it("hands the same layout to the surface and to the cards", () => {
    const wrapper = createWrapper();
    const layout = useLayout.mock.results.at(-1)?.value;

    expect(wrapper.findComponent(LayoutSurface).props("layout")).toBe(layout);
    expect(useSalesRepDashboardWidgets).toHaveBeenLastCalledWith(layout);
  });
});
