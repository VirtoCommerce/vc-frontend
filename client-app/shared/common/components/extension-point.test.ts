import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { onScopeDispose } from "vue";
import ExtensionPoint from "./extension-point.vue";
import type { Component } from "vue";

type EntryType = {
  component?: Component;
  props?: Record<string, unknown>;
  use?: () => Record<string, unknown>;
  condition?: (parameter: unknown) => boolean;
};

const h = vi.hoisted((): { entries: Record<string, Record<string, EntryType>> } => ({ entries: {} }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({
    getComponent: (category: string, name: string) => h.entries[category]?.[name]?.component ?? null,
    getContribution: (category: string, name: string) => h.entries[category]?.[name]?.use,
    getProps: (category: string, name: string) => h.entries[category]?.[name]?.props,
    isRegistered: (category: string, name: string) => Boolean(h.entries[category]?.[name]?.component),
    passesCondition: (category: string, name: string, parameter: unknown) => {
      const condition = h.entries[category]?.[name]?.condition;
      return typeof condition === "function" ? condition(parameter) : true;
    },
  }),
}));

// VTU does not narrow the component's `C` generic from a props object, so the condition
// parameter widens to the intersection of every category's. Cast once, here.
function mountWithSlot(conditionParameter?: unknown) {
  return mount(ExtensionPoint, {
    props: { category: "mobileMenu", name: "my-customers", conditionParameter } as never,
    slots: {
      default: `<template #default="slotProps">fallback:{{ slotProps.extensionProps?.count }}</template>`,
    },
  });
}

describe("ExtensionPoint", () => {
  it("renders the fallback slot with undefined props when nothing is registered", () => {
    h.entries = {};

    expect(mountWithSlot().text()).toBe("fallback:");
  });

  it("renders the registered component instead of the fallback slot", () => {
    h.entries = {
      mobileMenu: {
        "my-customers": { component: { name: "Registered", template: `<span>registered</span>` } },
      },
    };

    expect(mountWithSlot().text()).toBe("registered");
  });

  it("passes a use() contribution to the fallback slot", () => {
    h.entries = { mobileMenu: { "my-customers": { use: () => ({ count: 9 }) } } };

    expect(mountWithSlot().text()).toBe("fallback:9");
  });

  it("calls use() once per mount rather than once per render", async () => {
    let calls = 0;
    h.entries = {
      mobileMenu: {
        "my-customers": {
          use: () => {
            calls++;
            return { count: 4 };
          },
        },
      },
    };

    const wrapper = mountWithSlot();
    await wrapper.setProps({ category: "mobileMenu" });
    await wrapper.vm.$forceUpdate();

    expect(calls).toBe(1);
  });

  it("disposes the contribution when the extension point unmounts", () => {
    let disposed = false;
    h.entries = {
      mobileMenu: {
        "my-customers": {
          use: () => {
            onScopeDispose(() => {
              disposed = true;
            });
            return { count: 1 };
          },
        },
      },
    };

    const wrapper = mountWithSlot();
    expect(disposed).toBe(false);

    wrapper.unmount();
    expect(disposed).toBe(true);
  });

  it("does not call use() when the entry also renders a component", () => {
    let calls = 0;
    h.entries = {
      mobileMenu: {
        "my-customers": {
          component: { name: "Registered", template: `<span>registered</span>` },
          use: () => {
            calls++;
            return { count: 4 };
          },
        },
      },
    };

    expect(mountWithSlot().text()).toBe("registered");
    expect(calls).toBe(0);
  });

  it("skips the contribution when the entry's condition declines, keeping the fallback", () => {
    let calls = 0;
    h.entries = {
      mobileMenu: {
        "my-customers": {
          condition: (parameter) => parameter === "wanted",
          use: () => {
            calls++;
            return { count: 6 };
          },
        },
      },
    };

    expect(mountWithSlot("not-wanted").text()).toBe("fallback:");
    expect(calls).toBe(0);
  });

  it("runs the contribution when the entry's condition accepts", () => {
    h.entries = {
      mobileMenu: {
        "my-customers": { condition: (parameter) => parameter === "wanted", use: () => ({ count: 6 }) },
      },
    };

    expect(mountWithSlot("wanted").text()).toBe("fallback:6");
  });

  it("keeps the host's fallback rendering when use() throws", () => {
    h.entries = {
      mobileMenu: {
        "my-customers": {
          use: () => {
            throw new Error("plugin blew up");
          },
        },
      },
    };

    expect(mountWithSlot().text()).toBe("fallback:");
  });
});
