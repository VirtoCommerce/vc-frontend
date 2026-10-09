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

  // The attrs a call site binds now cross two components, both with inheritAttrs: false.
  it("forwards attrs and listeners through to the registered component", async () => {
    const received: Record<string, unknown>[] = [];
    let succeeded = 0;

    h.entries = {
      paymentPage: {
        "payment-methods": {
          component: {
            name: "PaymentMethod",
            inheritAttrs: false,
            props: { order: { type: Object, default: undefined }, paymentTypeName: String },
            emits: ["success"],
            setup(props: Record<string, unknown>) {
              received.push({ order: props.order, paymentTypeName: props.paymentTypeName });
            },
            template: `<button @click="$emit('success')">pay</button>`,
          },
        },
      },
    };

    const wrapper = mount(ExtensionPointList, {
      props: { category: "paymentPage" },
      attrs: {
        order: { id: "order-1" },
        paymentTypeName: "card",
        onSuccess: () => {
          succeeded++;
        },
      },
    });

    expect(received).toEqual([{ order: { id: "order-1" }, paymentTypeName: "card" }]);

    await wrapper.find("button").trigger("click");
    expect(succeeded).toBe(1);
  });
});
