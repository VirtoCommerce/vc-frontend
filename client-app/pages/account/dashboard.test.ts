import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { useAccountDashboard } from "@/shared/account/composables/useAccountDashboard";
import Dashboard from "./dashboard.vue";
import LayoutSurface from "@/shared/dashboard/components/layout-surface.vue";

const useLayout = vi.hoisted(() => vi.fn(() => ({ scope: "accountDashboard" })));
vi.mock("@/shared/dashboard/composables/useLayout", () => ({ useLayout }));
vi.mock("@/shared/account/composables/useAccountDashboard", async () => {
  const { ref } = await import("vue");
  return { useAccountDashboard: vi.fn(() => ({ cards: ref([]) })) };
});
vi.mock("@/core/composables", () => ({ usePageHead: vi.fn() }));

const createWrapper = createWrapperFactory(mount, Dashboard, {
  global: { stubs: { VcTypography: true, PendingInvitesWidget: true, LayoutSurface: true } },
});

describe("account dashboard page", () => {
  // The scope names the stored document: another one would show the user a different arrangement, or an empty one.
  it("drives the account dashboard's own saved layout", () => {
    createWrapper();

    expect(useLayout).toHaveBeenCalledWith("accountDashboard");
  });

  // One controller for both, so the surface and the statistics query can never disagree on what is shown.
  it("hands the same layout to the surface and to the cards", () => {
    const wrapper = createWrapper();
    const layout = useLayout.mock.results.at(-1)?.value;

    expect(wrapper.findComponent(LayoutSurface).props("layout")).toBe(layout);
    expect(useAccountDashboard).toHaveBeenLastCalledWith(layout);
  });

  // Not a block: it renders nothing without invitations, and invitations to act on must not be hideable.
  it("keeps the pending invitations above the layout", () => {
    const html = createWrapper().html();

    expect(html.indexOf("pending-invites-widget-stub")).toBeGreaterThan(-1);
    expect(html.indexOf("pending-invites-widget-stub")).toBeLessThan(html.indexOf("layout-surface-stub"));
  });
});
