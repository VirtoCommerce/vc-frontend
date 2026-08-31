import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { ACTIVITIES_ROUTE_NAME, CUSTOMER_PROFILE_ROUTE_NAME, MY_CUSTOMERS_ROUTE_NAME } from "../constants";
import { isMyCustomersArea } from "../routes";
import LinkMyCustomers from "./link-my-customers.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

// The rail's own state, driven directly: `useLink` answers for the link's route RECORD, and the whole
// point of `activeWhen` is that a record match cannot express what this link owns.
const router = await vi.hoisted(async () => {
  const { reactive, ref } = await import("vue");
  return {
    // Reactive, as vue-router's own is: a rule read through a non-reactive route would pass every
    // mount-per-route assertion below and still never follow a navigation.
    route: reactive<{ name?: string; query: Record<string, string> }>({ name: "Home", query: {} }),
    isActive: ref(false),
  };
});

vi.mock("vue-router", () => ({
  useRoute: () => router.route,
  useLink: () => ({ isActive: router.isActive }),
}));
vi.mock("../composables/useSalesRepCustomersCount", async () => {
  const { ref } = await import("vue");
  // Zero hides the badge, which is not what these tests are about.
  return { useSalesRepCustomersCount: () => ({ count: ref(0) }) };
});

const MenuItemStub = { name: "MenuItemStub", props: ["active", "to"], template: "<a><slot /></a>" };

const createWrapper = createWrapperFactory(mount, LinkMyCustomers, {
  global: {
    renderStubDefaultSlot: false,
    stubs: { VcMenuItem: MenuItemStub, VcIcon: true, VcBadge: true },
  },
});

const ITEM: ExtendedMenuLinkType = {
  id: MY_CUSTOMERS_ROUTE_NAME,
  title: "my customers",
  icon: "users",
  route: { name: MY_CUSTOMERS_ROUTE_NAME },
  activeWhen: isMyCustomersArea,
};

function navigate(route: { name?: string; query?: Record<string, string> }): void {
  router.route.name = route.name;
  router.route.query = route.query ?? {};
}

function mountAt(route: { name?: string; query?: Record<string, string> }, item: ExtendedMenuLinkType = ITEM) {
  navigate(route);
  return createWrapper({ props: { item } }).findComponent(MenuItemStub);
}

beforeEach(() => {
  router.isActive.value = false;
  navigate({ name: "Home" });
});

// The module renders this link itself (for the count badge), so it has to resolve the active state the
// way AccountNavigationItem does. Reading only `useLink` left every page the rule claims unlit — and
// on a customer's activity feed nothing in the rail was lit at all, since My activity disowns it.
describe("LinkMyCustomers highlight", () => {
  it.each([
    ["the customer list", { name: MY_CUSTOMERS_ROUTE_NAME }],
    ["a customer's profile", { name: CUSTOMER_PROFILE_ROUTE_NAME }],
    ["a customer's activity", { name: ACTIVITIES_ROUTE_NAME, query: { organizationId: "org-1" } }],
  ])("lights on %s", (_label, route) => {
    expect(mountAt(route).props("active")).toBe(true);
  });

  // The rep's own feed is My activity's page, not this one's.
  it("stays dark on the rep-wide activity feed", () => {
    expect(mountAt({ name: ACTIVITIES_ROUTE_NAME }).props("active")).toBe(false);
  });

  it("stays dark elsewhere in the account", () => {
    expect(mountAt({ name: "Orders" }).props("active")).toBe(false);
  });

  // The rail is not remounted per navigation, so the rule has to be read reactively.
  it("follows a navigation without being remounted", async () => {
    const wrapper = createWrapper({ props: { item: ITEM } });
    const link = () => wrapper.findComponent(MenuItemStub).props("active");

    expect(link()).toBe(false);

    navigate({ name: ACTIVITIES_ROUTE_NAME, query: { organizationId: "org-1" } });
    await nextTick();
    expect(link()).toBe(true);

    // Same route record, no customer — the query is the only thing that changed.
    navigate({ name: ACTIVITIES_ROUTE_NAME });
    await nextTick();
    expect(link()).toBe(false);
  });

  // A link registered without a rule keeps vue-router's record match, exactly as the shared component
  // does — nothing here may depend on `activeWhen` being present.
  it("falls back to the route-record match when the link declares no rule", () => {
    const plainItem: ExtendedMenuLinkType = { ...ITEM, activeWhen: undefined };

    router.isActive.value = true;
    expect(mountAt({ name: "Orders" }, plainItem).props("active")).toBe(true);

    router.isActive.value = false;
    expect(mountAt({ name: "Orders" }, plainItem).props("active")).toBe(false);
  });
});
