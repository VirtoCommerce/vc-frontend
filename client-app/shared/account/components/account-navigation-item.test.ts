import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import AccountNavigationItem from "./account-navigation-item.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { RouteLocationNormalizedLoaded, Router } from "vue-router";

const Page = { template: "<div />" };

// VcMenuItem's own props: `active` is the highlight this component decides.
const VcMenuItem = defineComponent({
  name: "VcMenuItem",
  props: { active: Boolean, to: [String, Object], color: String },
  template: "<div><slot /></div>",
});

// A rule a route record cannot express: the same route, with ?organizationId=, is another link's page.
const isCustomerActivity = (route: RouteLocationNormalizedLoaded) =>
  route.name === "Activities" && Boolean(route.query.organizationId);

let router: Router;

async function isLit(item: ExtendedMenuLinkType, url: string): Promise<boolean | undefined> {
  await router.push(url);
  await router.isReady();

  const wrapper = mount(AccountNavigationItem, {
    props: { item },
    global: { plugins: [router], stubs: { VcMenuItem, VcIcon: true } },
  });

  return wrapper.getComponent(VcMenuItem).props("active");
}

beforeEach(() => {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/company/activities", name: "Activities", component: Page },
      { path: "/company/my-customers", name: "MyCustomers", component: Page },
    ],
  });
});

describe("AccountNavigationItem highlight", () => {
  it("keeps vue-router's match for a link with no rule of its own", async () => {
    expect(await isLit({ title: "My activity", route: { name: "Activities" } }, "/company/activities")).toBe(true);
  });

  it("lights a link its rule claims, though vue-router matches another route", async () => {
    const item = { title: "My customers", route: { name: "MyCustomers" }, activeWhen: isCustomerActivity };

    expect(await isLit(item, "/company/activities?organizationId=org-1")).toBe(true);
  });

  it("leaves a link unlit when its rule says no, though vue-router matches it", async () => {
    const item: ExtendedMenuLinkType = {
      title: "My activity",
      route: { name: "Activities" },
      activeWhen: (route) => route.name === "Activities" && !isCustomerActivity(route),
    };

    expect(await isLit(item, "/company/activities?organizationId=org-1")).toBe(false);
  });
});
