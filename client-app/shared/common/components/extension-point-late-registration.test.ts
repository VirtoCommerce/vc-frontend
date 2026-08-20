import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import ExtensionPoint from "./extension-point.vue";

// Must NOT mock the registry: a stub cannot show that a real register() reaches a mounted component.
vi.mock("@/shared/common/constants/initialExtensionRegistry", () => ({
  initialExtensionRegistry: { mobileMenu: {} },
}));

function mountPoint(name: string) {
  return mount(ExtensionPoint, {
    props: { category: "mobileMenu", name } as never,
    slots: { default: `<template #default="s">fallback:{{ s.extensionProps?.count }}</template>` },
  });
}

describe("ExtensionPoint against the real registry", () => {
  it("starts a contribution registered after it mounted", async () => {
    const wrapper = mountPoint("late-badge");
    expect(wrapper.text()).toBe("fallback:");

    useExtensionRegistry().registerContribution("mobileMenu", "late-badge", { use: () => ({ count: 7 }) });
    await nextTick();

    expect(wrapper.text()).toBe("fallback:7");
  });

  it("renders a component registered after it mounted", async () => {
    const wrapper = mountPoint("late-widget");
    expect(wrapper.text()).toBe("fallback:");

    useExtensionRegistry().register("mobileMenu", "late-widget", {
      component: defineComponent({ name: "LateWidget", template: `<span>late</span>` }),
    });
    await nextTick();

    expect(wrapper.text()).toBe("late");
  });

  it("drops the contribution when the entry is unregistered", async () => {
    const wrapper = mountPoint("transient-badge");
    const { registerContribution, unregister } = useExtensionRegistry();

    registerContribution("mobileMenu", "transient-badge", { use: () => ({ count: 3 }) });
    await nextTick();
    expect(wrapper.text()).toBe("fallback:3");

    unregister("mobileMenu", "transient-badge");
    await nextTick();

    expect(wrapper.text()).toBe("fallback:");
  });
});
