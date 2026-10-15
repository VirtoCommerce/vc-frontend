import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import MobileMenuLink from "./mobile-menu-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { VueWrapper } from "@vue/test-utils";
import type { RouteLocationNormalizedLoaded, Router } from "vue-router";

const Page = { template: "<div />" };

// The Sales Rep hub's case: one route is the rep's own feed, and with ?organizationId= a customer's page.
const isCustomerActivity = (route: RouteLocationNormalizedLoaded) =>
  route.name === "Activities" && Boolean(route.query.organizationId);

let router: Router;

async function mountLink(link: ExtendedMenuLinkType, url: string) {
  await router.push(url);
  await router.isReady();

  return mount(MobileMenuLink, {
    props: { link },
    slots: { default: link.title ?? "" },
    global: { plugins: [router], stubs: { VcIcon: true, VcBadge: true } },
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

  // One customer's activity page belongs to My customers: the account rail lights it, so the mobile menu must too.
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
