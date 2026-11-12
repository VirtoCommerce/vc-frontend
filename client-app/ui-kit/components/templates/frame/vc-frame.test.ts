import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCommentVNode, createTextVNode, Fragment, h } from "vue";
import VcFrame from "./vc-frame.vue";

const NESTED_FRAME = { slots: { default: () => h(VcFrame) } };

enableAutoUnmount(afterEach);

describe("VcFrame", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("renders the header slot's root elements as the frame's own children, then main, then the footer", () => {
    const wrapper = mount(VcFrame, {
      slots: {
        header: '<div class="top-row">top</div><div class="sticky-row">bar</div>',
        footer: "<footer>footer</footer>",
      },
    });

    const childClasses = [...wrapper.element.children].map((child) => child.className);

    expect(childClasses).toEqual(["top-row", "sticky-row", "vc-frame__main", "vc-frame__footer"]);
  });

  it("renders the page inside <main id='main-content'>", () => {
    const wrapper = mount(VcFrame, { slots: { default: '<p class="page">page</p>' } });
    const main = wrapper.get("main");

    expect(main.attributes("id")).toBe("main-content");
    expect(main.classes()).toContain("vc-frame__main");
    expect(main.find(".page").exists()).toBe(true);
  });

  it("wraps a footer in the vc-frame__footer div", () => {
    const wrapper = mount(VcFrame, { slots: { footer: '<footer class="site-footer">footer</footer>' } });

    expect(wrapper.get(".vc-frame__footer").find(".site-footer").exists()).toBe(true);
  });

  it.each([
    ["text", { footer: () => [createTextVNode("© 2026")] }],
    ["a fragment with content", { footer: () => [h(Fragment, [h("footer")])] }],
    ["a fragment with a text string", { footer: () => [h(Fragment, ["© 2026"])] }],
    ["a fragment with a nested array", { footer: () => [h(Fragment, [[h("footer")]])] }],
    ["a fragment with a number", { footer: () => [h(Fragment, [0])] }],
  ])("renders the vc-frame__footer div for %s", (_name, slots) => {
    const wrapper = mount(VcFrame, { slots });

    expect(wrapper.find(".vc-frame__footer").exists()).toBe(true);
  });

  it.each([
    ["no footer slot", {}],
    ["a footer slot that renders only a v-if comment", { footer: () => [createCommentVNode("v-if", true)] }],
    ["a footer slot that renders only whitespace", { footer: () => [createTextVNode("   ")] }],
    [
      "a footer slot whose fragment renders nothing",
      { footer: () => [h(Fragment, [createCommentVNode("v-for", true)])] },
    ],
    ["a footer slot whose fragment holds only null", { footer: () => [h(Fragment, [null])] }],
    ["a footer slot whose fragment holds an empty nested array", { footer: () => [h(Fragment, [[null]])] }],
    ["a footer slot whose fragment holds a blank string", { footer: () => [h(Fragment, ["  "])] }],
  ])("renders no vc-frame__footer div for %s", (_name, slots) => {
    const wrapper = mount(VcFrame, { slots });

    expect(wrapper.find(".vc-frame__footer").exists()).toBe(false);
  });

  it("warns in development when rendered inside another frame", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mount(VcFrame, NESTED_FRAME);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("VcFrame: rendered inside another VcFrame");
  });

  it("stays silent about a nested frame in production builds", () => {
    vi.stubEnv("DEV", false);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mount(VcFrame, NESTED_FRAME);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn for one frame", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mount(VcFrame, { slots: { default: "<p>page</p>" } });

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
