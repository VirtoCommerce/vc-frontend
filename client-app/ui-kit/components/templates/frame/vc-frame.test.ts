import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCommentVNode, Fragment, h } from "vue";
import VcFrame from "./vc-frame.vue";

enableAutoUnmount(afterEach);

describe("VcFrame", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the header slot's root elements as the frame's own children, before main", () => {
    const wrapper = mount(VcFrame, {
      slots: { header: '<div class="top-row">top</div><div class="sticky-row">bar</div>' },
    });

    const children = [...wrapper.element.children].map((child) => child.className);

    expect(children.slice(0, 3)).toEqual(["top-row", "sticky-row", "vc-frame__main"]);
  });

  it("renders the page inside <main id='main-content'>", () => {
    const wrapper = mount(VcFrame, { slots: { default: '<p class="page">page</p>' } });
    const main = wrapper.get("main");

    expect(main.attributes("id")).toBe("main-content");
    expect(main.classes()).toContain("vc-frame__main");
    expect(main.find(".page").exists()).toBe(true);
  });

  it("wraps a footer in the footer element", () => {
    const wrapper = mount(VcFrame, { slots: { footer: '<footer class="site-footer">footer</footer>' } });

    expect(wrapper.get(".vc-frame__footer").find(".site-footer").exists()).toBe(true);
  });

  it.each([
    ["no footer slot", {}],
    ["a footer slot that renders only a v-if comment", { footer: () => [createCommentVNode("v-if", true)] }],
    ["a footer slot that renders only whitespace", { footer: "   " }],
    [
      "a footer slot whose fragment renders nothing",
      { footer: () => [h(Fragment, [createCommentVNode("v-for", true)])] },
    ],
  ])("renders no footer element for %s", (_name, slots) => {
    const wrapper = mount(VcFrame, { slots });

    expect(wrapper.find(".vc-frame__footer").exists()).toBe(false);
  });

  it("warns in development when rendered inside another frame", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mount(VcFrame, { slots: { default: () => h(VcFrame) } });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("VcFrame: rendered inside another VcFrame");
  });

  it("does not warn for one frame", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mount(VcFrame, { slots: { default: "<p>page</p>" } });

    expect(warn).not.toHaveBeenCalled();
  });
});
