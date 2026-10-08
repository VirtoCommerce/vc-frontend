import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { applyContributions, releaseContributions } from "./declare";
import { resetPluginStatuses, setPluginStatus } from "./status";

const Layout = { template: "<div class='company-layout'><router-view /></div>" };
const RealPage = { template: "<p class='real-page'>documents</p>" };
const context = { setting: () => true, themeSetting: () => undefined, isAuthenticated: true, can: () => true };

async function openDeepLink(extraRoutes: { path: string; parent: "Company"; name: string }[] = []) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/company", name: "Company", component: Layout, children: [] },
      { path: "/404", name: "NotFound", component: { template: "<h1 class='not-found'>404</h1>" } },
      { path: "/:pathMatch(.*)*", name: "Matcher", component: { template: "<div class='matcher' />" } },
    ],
  });
  setPluginStatus("p", "pending");
  const applied = applyContributions(
    "p",
    { format: 1, routes: [{ path: "documents", parent: "Company", name: "SalesRepDocuments" }, ...extraRoutes] },
    context,
    router,
  );
  await router.push("/company/documents?tab=all");
  const wrapper = mount(defineComponent({ render: () => h(RouterView) }), {
    global: { plugins: [router], stubs: { VcLoader: { template: "<i class='loader' />" } } },
  });
  await flushPromises();
  return { router, wrapper, applied };
}

describe("PluginRoutePlaceholder", () => {
  beforeEach(() => {
    resetPluginStatuses();
  });

  it("renders a loader inside the declared parent's layout while the plugin is on the way", async () => {
    const { wrapper } = await openDeepLink();

    expect(wrapper.find(".company-layout .plugin-route-placeholder .loader").exists()).toBe(true);
  });

  it("becomes the plugin's page, at the same URL, once the plugin claimed its route", async () => {
    const { router, wrapper, applied } = await openDeepLink();

    router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: RealPage });
    releaseContributions(applied, router, true);
    setPluginStatus("p", "loaded");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".company-layout .real-page").exists()).toBe(true);
    expect(router.currentRoute.value.fullPath).toBe("/company/documents?tab=all");
  });

  it("becomes the host's not-found page in place when the plugin failed — not an endless loader", async () => {
    const { router, wrapper, applied } = await openDeepLink();

    releaseContributions(applied, router, false);
    setPluginStatus("p", "failed");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".not-found").exists()).toBe(true);
    expect(wrapper.find(".loader").exists()).toBe(false);
    expect(router.currentRoute.value.fullPath).toBe("/company/documents?tab=all");
  });

  it("follows the user to another pending route of the plugin and resolves that one when it settles", async () => {
    const { router, wrapper, applied } = await openDeepLink([
      { path: "customers", parent: "Company", name: "SalesRepCustomers" },
    ]);
    await router.push("/company/customers");
    await flushPromises();

    router.addRoute("Company", { path: "customers", name: "SalesRepCustomers", component: RealPage });
    releaseContributions(applied, router, true);
    setPluginStatus("p", "loaded");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".company-layout .real-page").exists()).toBe(true);
    expect(wrapper.find(".loader").exists()).toBe(false);
  });

  it("shows a loader again on another plugin's pending route after this one ended on not-found", async () => {
    const { router, wrapper, applied } = await openDeepLink();
    setPluginStatus("q", "pending");
    applyContributions(
      "q",
      { format: 1, routes: [{ path: "reports", parent: "Company", name: "Reports" }] },
      context,
      router,
    );
    releaseContributions(applied, router, false);
    setPluginStatus("p", "failed");
    await flushPromises();
    expect(wrapper.find(".not-found").exists()).toBe(true);

    await router.push("/company/reports");
    await flushPromises();

    expect(wrapper.find(".loader").exists()).toBe(true);
  });
});

describe("PluginRoutePlaceholder and the organization gate", () => {
  beforeEach(() => {
    resetPluginStatuses();
  });

  // The host's guard (router/index.ts), with a user who belongs to no organization.
  async function openAsUserWithoutOrganization(realRouteMeta: Record<string, unknown>) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/account", name: "Account", component: { template: "<p class='account' />" } },
        {
          path: "/company",
          name: "Company",
          component: Layout,
          children: [],
          meta: { requiresOrganization: true },
        },
      ],
    });
    router.beforeEach((to) => (to.meta.requiresOrganization ? { name: "Account" } : true));
    setPluginStatus("p", "pending");
    const applied = applyContributions(
      "p",
      { format: 1, routes: [{ path: "dashboard", parent: "Company", name: "HubDashboard" }] },
      context,
      router,
    );
    await router.push("/company/dashboard");
    const wrapper = mount(defineComponent({ render: () => h(RouterView) }), {
      global: { plugins: [router], stubs: { VcLoader: { template: "<i class='loader' />" } } },
    });
    await flushPromises();
    const onPlaceholder = router.currentRoute.value.fullPath;

    router.addRoute("Company", { path: "dashboard", name: "HubDashboard", component: RealPage, meta: realRouteMeta });
    releaseContributions(applied, router, true);
    setPluginStatus("p", "loaded");
    await flushPromises();
    await flushPromises();

    return { router, wrapper, onPlaceholder };
  }

  it("keeps the deep link of a route that clears the parent's gate", async () => {
    const { router, wrapper, onPlaceholder } = await openAsUserWithoutOrganization({ requiresOrganization: false });

    expect(onPlaceholder).toBe("/company/dashboard");
    expect(router.currentRoute.value.fullPath).toBe("/company/dashboard");
    expect(wrapper.find(".real-page").exists()).toBe(true);
  });

  it("still applies the gate, once the plugin settles, to a route that keeps it", async () => {
    const { router, onPlaceholder } = await openAsUserWithoutOrganization({});

    expect(onPlaceholder).toBe("/company/dashboard");
    expect(router.currentRoute.value.name).toBe("Account");
  });
});
