import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { applyContributions, releaseContributions } from "./declare";
import { PLACEHOLDER_SLOW_NOTICE_MS } from "./placeholder";
import { expirePendingAfter, resetPluginStatuses, setPluginStatus } from "./status";

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
    global: {
      plugins: [router],
      stubs: {
        VcLoader: { template: "<i class='loader' />" },
        VcButton: { template: "<button class='reload'><slot /></button>" },
      },
      mocks: { $t: (key: string) => key },
    },
  });
  await flushPromises();
  return { router, wrapper, applied };
}

describe("PluginRoutePlaceholder", () => {
  beforeEach(() => {
    resetPluginStatuses();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders a loader inside the declared parent's layout while the plugin is on the way", async () => {
    const { wrapper } = await openDeepLink();

    const placeholder = wrapper.find(".company-layout [data-test-id='plugin-route-placeholder-section']");
    expect(placeholder.find(".loader").exists()).toBe(true);
    expect(placeholder.text()).toBe("common.messages.page_loading");
    expect(placeholder.attributes()).not.toHaveProperty("aria-busy");
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

  it("offers a reload in place when the plugin failed — not an endless loader, not a 404", async () => {
    const { router, wrapper, applied } = await openDeepLink();
    const reload = vi.fn();
    vi.stubGlobal("location", { ...location, reload });

    releaseContributions(applied, router, false);
    setPluginStatus("p", "failed");
    await flushPromises();
    await flushPromises();
    await wrapper.find(".reload").trigger("click");

    expect(wrapper.find(".not-found").exists()).toBe(false);
    expect(wrapper.find(".loader").exists()).toBe(false);
    expect(wrapper.text()).toContain("common.messages.content_failed_to_load");
    expect(reload).toHaveBeenCalledOnce();
    expect(router.currentRoute.value.fullPath).toBe("/company/documents?tab=all");
  });

  it("becomes the host's not-found page in place when the plugin was skipped", async () => {
    const { router, wrapper, applied } = await openDeepLink();

    releaseContributions(applied, router, false);
    setPluginStatus("p", "skipped");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".not-found").exists()).toBe(true);
    expect(wrapper.find(".loader").exists()).toBe(false);
  });

  it("says the page is slow, with a reload, once the plugin is late — and keeps waiting for it", async () => {
    vi.useFakeTimers();
    const { router, wrapper, applied } = await openDeepLink();
    expect(wrapper.text()).toBe("common.messages.page_loading");

    vi.advanceTimersByTime(PLACEHOLDER_SLOW_NOTICE_MS);
    await flushPromises();

    expect(wrapper.find(".loader").exists()).toBe(true);
    expect(wrapper.text()).toContain("common.messages.page_loading_slow");
    expect(wrapper.find(".reload").exists()).toBe(true);

    router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: RealPage });
    releaseContributions(applied, router, true);
    setPluginStatus("p", "loaded");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".company-layout .real-page").exists()).toBe(true);
  });

  it("keeps waiting, not 404, when the plugin outlives its pending deadline", async () => {
    vi.useFakeTimers();
    const { wrapper } = await openDeepLink();

    expirePendingAfter("p", 0);
    vi.runAllTimers();
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".not-found").exists()).toBe(false);
    expect(wrapper.find(".loader").exists()).toBe(true);
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
    setPluginStatus("p", "skipped");
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
      global: {
        plugins: [router],
        stubs: { VcLoader: { template: "<i class='loader' />" } },
        mocks: { $t: (key: string) => key },
      },
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
