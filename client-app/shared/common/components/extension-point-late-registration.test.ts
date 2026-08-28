import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, inject, nextTick, onScopeDispose } from "vue";
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
    global: { provide: { COUNT_SOURCE: 9 } },
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

  it("gives a late contribution an injection context, so use() may resolve host singletons", async () => {
    const wrapper = mountPoint("injecting-badge");

    useExtensionRegistry().registerContribution("mobileMenu", "injecting-badge", {
      use: () => ({ count: inject<number>("COUNT_SOURCE") }),
    });
    await nextTick();

    expect(wrapper.text()).toBe("fallback:9");
  });

  it("runs the replacement when an entry is swapped under the same name in one tick", async () => {
    const calls: string[] = [];
    let disposedOld = false;
    const { registerContribution, unregister } = useExtensionRegistry();

    registerContribution("mobileMenu", "swap", {
      use: () => {
        calls.push("old");
        onScopeDispose(() => {
          disposedOld = true;
        });
        return { count: 1 };
      },
    });
    const wrapper = mountPoint("swap");
    expect(wrapper.text()).toBe("fallback:1");

    // The name does not change, so keying the child on `name` alone left the key untouched: Vue
    // patched the existing instance, which reads `use` once in setup, so the replacement never ran
    // and the old scope never stopped. register() refuses a duplicate, which is why a swap has to
    // be unregister + register - and README step 2 teaches exactly that pattern.
    unregister("mobileMenu", "swap");
    registerContribution("mobileMenu", "swap", { use: () => ({ count: 2 }) });
    await nextTick();

    expect(calls).toEqual(["old"]);
    expect(wrapper.text()).toBe("fallback:2");
    expect(disposedOld).toBe(true);
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
