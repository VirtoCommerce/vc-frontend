import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ExtensionPoint from "./extension-point.vue";
import type { Component } from "vue";

type EntryType = { component?: Component; props?: Record<string, unknown> };

const h = vi.hoisted((): { entries: Record<string, Record<string, EntryType>> } => ({ entries: {} }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({
    getComponent: (category: string, name: string) => h.entries[category]?.[name]?.component ?? null,
    getProps: (category: string, name: string) => h.entries[category]?.[name]?.props,
    isRegistered: (category: string, name: string) => Boolean(h.entries[category]?.[name]?.component),
  }),
}));

function mountWithSlot() {
  return mount(ExtensionPoint, {
    props: { category: "mobileMenu", name: "my-customers" },
    slots: {
      default: `<template #default="slotProps">fallback:{{ slotProps.extensionProps?.count }}</template>`,
    },
  });
}

describe("ExtensionPoint", () => {
  it("passes a component-less entry's props to the fallback slot", () => {
    h.entries = { mobileMenu: { "my-customers": { props: { count: 7 } } } };

    expect(mountWithSlot().text()).toBe("fallback:7");
  });

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
});
