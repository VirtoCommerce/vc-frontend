import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import HeaderBadge from "./header-badge.vue";

// Mirrors VcBadge: no default slot means a dot
const VcBadge = { template: '<span :data-dot="!$slots.default"><slot /></span>' };

function mountBadge(props: { count?: number; dot?: boolean }) {
  return mount(HeaderBadge, { props, global: { stubs: { VcBadge, transition: false } } });
}

describe("HeaderBadge", () => {
  it("caps the visible number at 99+", () => {
    const badge = mountBadge({ count: 1543 }).get(".header-badge");

    expect(badge.text()).toBe("99+");
    expect(badge.attributes("data-dot")).toBe("false");
  });

  it("renders its own dot instead of a numbered VcBadge", () => {
    const wrapper = mountBadge({ count: 1543, dot: true });
    const dot = wrapper.get(".header-badge");

    expect(dot.classes()).toContain("header-badge--dot");
    expect(dot.text()).toBe("");
    expect(dot.attributes("aria-hidden")).toBe("true");
    expect(wrapper.find("[data-dot]").exists()).toBe(false);
  });

  it("renders nothing without a count", () => {
    expect(mountBadge({ count: 0, dot: true }).find(".header-badge").exists()).toBe(false);
  });
});
