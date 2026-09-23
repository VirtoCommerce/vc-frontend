import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { applyContributions, releaseContributions } from "./declare";
import { resetPluginStatuses, setPluginStatus } from "./status";

vi.mock("@/pages/404.vue", () => ({ __esModule: true, default: { template: "<h1 class='not-found'>404</h1>" } }));

const Layout = { template: "<div class='company-layout'><router-view /></div>" };
const RealPage = { template: "<p class='real-page'>documents</p>" };
const context = { setting: () => true, themeSetting: () => undefined, isAuthenticated: true, can: () => true };

async function openDeepLink() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/company", name: "Company", component: Layout, children: [] },
      { path: "/:pathMatch(.*)*", name: "Matcher", component: { template: "<div class='matcher' />" } },
    ],
  });
  setPluginStatus("p", "pending");
  const applied = applyContributions(
    "p",
    { format: 1, routes: [{ path: "documents", parent: "Company", name: "SalesRepDocuments" }] },
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
});
