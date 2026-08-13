import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ExtensionPointList from "./extension-point-list.vue";
import type { Component } from "vue";

type EntryType = {
  component?: Component;
  props?: Record<string, unknown>;
  use?: () => Record<string, unknown>;
};

const h = vi.hoisted((): { entries: Record<string, Record<string, EntryType>> } => ({ entries: {} }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({
    getComponent: (category: string, name: string) => h.entries[category]?.[name]?.component ?? null,
    getContribution: (category: string, name: string) => h.entries[category]?.[name]?.use,
    getEntries: (category: string) => h.entries[category] ?? {},
    getProps: (category: string, name: string) => h.entries[category]?.[name]?.props,
    isRegistered: (category: string, name: string) => Boolean(h.entries[category]?.[name]?.component),
    passesCondition: () => true,
  }),
}));

function mountList() {
  return mount(ExtensionPointList, {
    props: { category: "mobileHeader" },
    slots: {
      default: `<template #default="s">[{{ s.name }}:{{ s.extensionProps?.count }}]</template>`,
    },
  });
}

describe("ExtensionPointList", () => {
  it("renders each registered component", () => {
    h.entries = {
      mobileHeader: {
        one: { component: { name: "One", template: `<span>one</span>` } },
        two: { component: { name: "Two", template: `<span>two</span>` } },
      },
    };

    expect(mountList().text()).toBe("onetwo");
  });

  it("falls through to the slot with the contribution for a component-less entry", () => {
    h.entries = { mobileHeader: { badge: { use: () => ({ count: 3 }) } } };

    expect(mountList().text()).toBe("[badge:3]");
  });

  it("mixes both modes in one list", () => {
    h.entries = {
      mobileHeader: {
        widget: { component: { name: "Widget", template: `<span>widget</span>` } },
        badge: { use: () => ({ count: 9 }) },
      },
    };

    expect(mountList().text()).toBe("widget[badge:9]");
  });

  it("renders nothing for an empty category", () => {
    h.entries = {};

    expect(mountList().text()).toBe("");
  });
});
