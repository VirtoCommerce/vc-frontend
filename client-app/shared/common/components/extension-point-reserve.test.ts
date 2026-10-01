import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { applyContributions, resetDeclaredSlots } from "@/modules/federated/contributions/declare";
import { resetPluginStatuses, setPluginStatus } from "@/modules/federated/contributions/status";
import ExtensionPointList from "./extension-point-list.vue";
import ExtensionPoint from "./extension-point.vue";
import type { IPluginContributionsType } from "@/modules/federated/contributions/types";
import type { Component } from "vue";

const h = vi.hoisted((): { entries: Record<string, Record<string, { component?: Component }>> } => ({ entries: {} }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({
    getComponent: (category: string, name: string) => h.entries[category]?.[name]?.component ?? null,
    getContribution: () => undefined,
    getProps: () => undefined,
    getEntries: (category: string) => h.entries[category] ?? {},
    isRegistered: (category: string, name: string) => Boolean(h.entries[category]?.[name]?.component),
    passesCondition: () => true,
  }),
}));

const Plugin = { template: "<button class='plugin-markup'>plugin</button>" };

const context = { setting: () => true, themeSetting: () => undefined, isAuthenticated: true, can: () => true };

function declare(contributions: Omit<IPluginContributionsType, "format">) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { template: "<div />" } }],
  });
  setPluginStatus("p", "pending");
  applyContributions("p", { format: 1, ...contributions }, context, router);
}

function mountPoint(category: string, name: string, conditionParameter?: unknown) {
  return mount(ExtensionPoint, {
    props: { category, name, conditionParameter } as never,
    slots: { default: "<a class='host-link'>host link</a>" },
    global: { stubs: { VcLoader: { template: "<i class='loader' />" } } },
  });
}

describe("ExtensionPoint holding a declared slot", () => {
  beforeEach(() => {
    h.entries = {};
    resetPluginStatuses();
    resetDeclaredSlots();
  });

  it("holds the host's own markup, hidden, while the declaring plugin is on the way", () => {
    declare({ slots: [{ at: "accountMenu/docs", policy: "reserve" }] });

    const wrapper = mountPoint("accountMenu", "docs");
    const box = wrapper.find(".extension-point-reserve");

    expect(box.exists()).toBe(true);
    expect(box.attributes("data-slot")).toBe("accountMenu/docs");
    expect(box.attributes("aria-busy")).toBe("true");
    expect(box.find(".extension-point-reserve__fallback").attributes()).toHaveProperty("inert");
    expect(box.find(".host-link").exists()).toBe(true);
  });

  it("does not reveal a registered component before its plugin settled, then does", async () => {
    declare({ slots: [{ at: "accountMenu/docs", policy: "reserve" }] });
    h.entries = { accountMenu: { docs: { component: Plugin } } };
    const wrapper = mountPoint("accountMenu", "docs");

    expect(wrapper.find(".plugin-markup").exists()).toBe(false);

    setPluginStatus("p", "loaded");
    await flushPromises();

    expect(wrapper.find(".extension-point-reserve").exists()).toBe(false);
    expect(wrapper.find(".plugin-markup").exists()).toBe(true);
  });

  it("falls back to the host's markup when the plugin failed", async () => {
    declare({ slots: [{ at: "accountMenu/docs", policy: "reserve" }] });
    const wrapper = mountPoint("accountMenu", "docs");

    setPluginStatus("p", "failed");
    await flushPromises();

    expect(wrapper.find(".extension-point-reserve").exists()).toBe(false);
    expect(wrapper.find(".host-link").exists()).toBe(true);
  });

  it("holds nothing where the declaration's field condition does not match this item", () => {
    declare({
      slots: [{ at: "sharedList/provenance-note", policy: "reserve", when: { field: "scope", eq: "Customer" } }],
    });

    expect(
      mountPoint("sharedList", "provenance-note", { scope: "Private" }).find(".extension-point-reserve").exists(),
    ).toBe(false);
    expect(
      mountPoint("sharedList", "provenance-note", { scope: "Customer" }).find(".extension-point-reserve").exists(),
    ).toBe(true);
  });

  it("holds nothing for a `none` contribution", () => {
    declare({ slots: [{ at: "mobileMenu/docs", policy: "none" }] });

    expect(mountPoint("mobileMenu", "docs").find(".extension-point-reserve").exists()).toBe(false);
  });

  it("holds a whole `block` region, with a loader, in a list that has nothing registered yet", () => {
    declare({
      slots: [{ at: "cartPayment/skyflow", policy: "block", when: { field: "paymentTypeName", eq: "Skyflow" } }],
    });

    const matching = mount(ExtensionPointList, {
      props: { category: "cartPayment", conditionParams: { paymentTypeName: "Skyflow" } } as never,
      global: { stubs: { VcLoader: { template: "<i class='loader' />" } } },
    });
    const other = mount(ExtensionPointList, {
      props: { category: "cartPayment", conditionParams: { paymentTypeName: "Card" } } as never,
    });

    expect(matching.find(".extension-point-reserve[data-policy='block'] .loader").exists()).toBe(true);
    expect(other.find(".extension-point-reserve").exists()).toBe(false);
  });
});
