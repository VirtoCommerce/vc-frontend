import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import MobileMenuLink from "./mobile-menu-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { VueWrapper } from "@vue/test-utils";
import type { RouteLocationNormalizedLoaded, Router } from "vue-router";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
    n: (value: number) => String(value),
  }),
}));

const Page = { template: "<div />" };

// A rule a route record cannot express: the same route, with ?organizationId=, is another link's page.
const isCustomerActivity = (route: RouteLocationNormalizedLoaded) =>
  route.name === "Activities" && Boolean(route.query.organizationId);

let router: Router;

async function mountLink(link: ExtendedMenuLinkType, url: string, count?: number) {
  await router.push(url);
  await router.isReady();

  return mount(MobileMenuLink, {
    props: { link, count },
    slots: { default: link.title ?? "" },
    global: { plugins: [router], stubs: { VcIcon: true, VcBadge: { template: "<span><slot /></span>" } } },
  });
}

// The label is the link's only span, and its colour is the highlight.
const isLit = (wrapper: VueWrapper) => wrapper.get("span").classes().includes("text-[--mobile-menu-link-active-color]");

beforeEach(() => {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/company/activities", name: "Activities", component: Page },
      { path: "/company/my-customers", name: "MyCustomers", component: Page },
    ],
  });
});

describe("MobileMenuLink highlight", () => {
  it("keeps vue-router's match for a link with no rule of its own", async () => {
    const wrapper = await mountLink({ title: "My activity", route: { name: "Activities" } }, "/company/activities");

    expect(isLit(wrapper)).toBe(true);
  });

  // A page a link's rule claims: the account rail lights it, so the mobile menu must too.
  it("lights a link its rule claims, though vue-router matches another route", async () => {
    const wrapper = await mountLink(
      { title: "My customers", route: { name: "MyCustomers" }, activeWhen: isCustomerActivity },
      "/company/activities?organizationId=org-1",
    );

    expect(isLit(wrapper)).toBe(true);
  });

  it("leaves a link unlit when its rule says no, though vue-router matches it", async () => {
    const wrapper = await mountLink(
      {
        title: "My activity",
        route: { name: "Activities" },
        activeWhen: (route) => route.name === "Activities" && !isCustomerActivity(route),
      },
      "/company/activities?organizationId=org-1",
    );

    expect(isLit(wrapper)).toBe(false);
  });
});

describe("MobileMenuLink count", () => {
  it("shows the capped badge but puts the full count into the accessible name", async () => {
    const wrapper = await mountLink({ title: "Cart", route: { name: "Activities" } }, "/company/activities", 1543);

    const badge = wrapper.get(".header-badge");
    expect(badge.text()).toBe("99+");
    expect(badge.attributes("aria-hidden")).toBe("true");
    expect(wrapper.get("a").attributes("aria-label")).toBe(
      'shared.layout.header.link_with_count {"title":"Cart","count":"1543"}',
    );
  });

  it("keeps the visible text as the name when there is no count", async () => {
    const wrapper = await mountLink({ title: "Cart", route: { name: "Activities" } }, "/company/activities");

    expect(wrapper.find(".header-badge").exists()).toBe(false);
    expect(wrapper.get("a").attributes("aria-label")).toBeUndefined();
  });
});
