import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcWidget from "../widget/vc-widget.vue";
import VcWidgetSkeleton from "./vc-widget-skeleton.vue";

function mountSkeleton(
  props: InstanceType<typeof VcWidgetSkeleton>["$props"] = {},
  attrs: Record<string, unknown> = {},
) {
  return mount(VcWidgetSkeleton, {
    props,
    attrs,
    global: { components: { VcWidget }, stubs: { VcIcon: true, VcShape: true } },
  });
}

describe("VcWidgetSkeleton", () => {
  it("renders a VcWidget of its size as its root", () => {
    const wrapper = mountSkeleton({ size: "lg" });

    expect(wrapper.findComponent(VcWidget).element).toBe(wrapper.element);
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["vc-widget-skeleton", "vc-widget--size--lg"]));
  });

  it("drops the widget's shadow with noShadow", () => {
    expect(mountSkeleton().classes()).not.toContain("vc-widget--no-shadow");
    expect(mountSkeleton({ noShadow: true }).classes()).toContain("vc-widget--no-shadow");
  });

  it("passes the widget's frame props and classes through", () => {
    const wrapper = mountSkeleton({}, { border: false, class: "h-full" });

    expect(wrapper.classes()).toEqual(expect.arrayContaining(["vc-widget--no-border", "h-full"]));
  });

  it("draws the header and footer placeholders only with head and foot", () => {
    const plain = mountSkeleton();
    const full = mountSkeleton({ head: true, foot: true });

    expect(plain.find(".vc-widget__header-container").exists()).toBe(false);
    expect(plain.find(".vc-widget__footer-container").exists()).toBe(false);
    expect(full.find(".vc-widget__header .vc-widget-skeleton__header").exists()).toBe(true);
    expect(full.find(".vc-widget__footer .vc-widget-skeleton__footer").exists()).toBe(true);
  });

  it("draws five body placeholders by default", () => {
    expect(mountSkeleton().findAll(".vc-widget__slot .vc-widget-skeleton__slot > div")).toHaveLength(5);
  });
});
