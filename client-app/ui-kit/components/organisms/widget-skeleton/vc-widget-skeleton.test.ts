import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import VcWidget from "../widget/vc-widget.vue";
import VcWidgetSkeleton from "./vc-widget-skeleton.vue";

function mountSkeleton(
  props: InstanceType<typeof VcWidgetSkeleton>["$props"] = {},
  attrs: Record<string, unknown> = {},
  slots: Record<string, string> = {},
) {
  return mount(VcWidgetSkeleton, {
    props,
    attrs,
    slots,
    global: { components: { VcWidget }, stubs: { VcIcon: true, VcShape: true } },
  });
}

describe("VcWidgetSkeleton", () => {
  it("renders a VcWidget of its size as its root", () => {
    const wrapper = mountSkeleton({ size: "lg" });

    expect(wrapper.findComponent(VcWidget).element).toBe(wrapper.element);
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["vc-widget-skeleton", "vc-widget--size--lg"]));
  });

  it("marks its size with its own modifier", () => {
    expect(mountSkeleton({ size: "lg" }).classes()).toContain("vc-widget-skeleton--size--lg");
    expect(mountSkeleton().classes()).toContain("vc-widget-skeleton--size--md");
  });

  it("drops the widget's shadow with noShadow", () => {
    expect(mountSkeleton().classes()).not.toContain("vc-widget--no-shadow");
    expect(mountSkeleton({ noShadow: true }).classes()).toContain("vc-widget--no-shadow");
  });

  it("passes the widget's frame props and classes through", () => {
    const wrapper = mountSkeleton({}, { border: false, class: "h-full" });

    expect(wrapper.classes()).toEqual(expect.arrayContaining(["vc-widget--no-border", "h-full"]));
  });

  it("passes listeners through to the widget", async () => {
    const onClick = vi.fn();

    await mountSkeleton({}, { onClick }).trigger("click");

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders no title text from a title", () => {
    const wrapper = mountSkeleton({}, { title: "Orders" });

    expect(wrapper.text()).toBe("");
    expect(wrapper.find(".vc-widget__header-container").exists()).toBe(false);
  });

  it("keeps the widget's title and icons off the widget", () => {
    const wrapper = mountSkeleton(
      { head: true },
      { title: "Orders", "prepend-icon": "academic-cap", appendIcon: "star" },
    );

    expect(wrapper.findComponent(VcWidget).props()).toMatchObject({
      title: undefined,
      prependIcon: undefined,
      appendIcon: undefined,
    });
  });

  it("passes collapsed through to the widget", () => {
    const wrapper = mountSkeleton({ head: true }, { collapsed: true });

    expect(wrapper.classes()).toContain("vc-widget--collapsed");
    expect(wrapper.find<HTMLElement>(".vc-widget__slot-container").element.style.display).toBe("none");
  });

  it("keeps a collapsible widget's button and class off the skeleton", () => {
    const wrapper = mountSkeleton({ head: true }, { collapsible: true });

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.classes()).not.toContain("vc-widget--collapsible");
  });

  it("still hides the body of a skeleton given collapsible and collapsed", () => {
    const wrapper = mountSkeleton({ head: true }, { collapsible: true, collapsed: true });

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.find<HTMLElement>(".vc-widget__slot-container").element.style.display).toBe("none");
  });

  it("draws the header and footer placeholders only with head and foot", () => {
    const plain = mountSkeleton();
    const full = mountSkeleton({ head: true, foot: true });

    expect(plain.find(".vc-widget__header-container").exists()).toBe(false);
    expect(plain.find(".vc-widget__footer-container").exists()).toBe(false);
    expect(full.find(".vc-widget__header .vc-widget-skeleton__header").exists()).toBe(true);
    expect(full.find(".vc-widget__footer .vc-widget-skeleton__footer").exists()).toBe(true);
  });

  it("draws one placeholder bar in the header with head", () => {
    expect(mountSkeleton({ head: true }).findAll(".vc-widget-skeleton__header > div")).toHaveLength(1);
  });

  it("draws one placeholder bar in the footer with foot", () => {
    expect(mountSkeleton({ foot: true }).findAll(".vc-widget-skeleton__footer > div")).toHaveLength(1);
  });

  it("draws five body placeholders by default", () => {
    expect(mountSkeleton().findAll(".vc-widget__slot .vc-widget-skeleton__slot > div")).toHaveLength(5);
  });

  it("puts header-container content into the widget's header container", () => {
    const wrapper = mountSkeleton({}, {}, { "header-container": '<i class="bar" />' });

    expect(wrapper.find(".vc-widget__header-container > .vc-widget-skeleton__header-container > .bar").exists()).toBe(
      true,
    );
  });

  it("draws the header from a header slot without head", () => {
    const wrapper = mountSkeleton({}, {}, { header: '<i class="bar" />' });

    expect(wrapper.find(".vc-widget__header > .vc-widget-skeleton__header > .bar").exists()).toBe(true);
  });

  it("puts default-container content into the widget's slot container", () => {
    const wrapper = mountSkeleton({}, {}, { "default-container": '<i class="bar" />' });

    expect(wrapper.find(".vc-widget__slot-container > .vc-widget-skeleton__slot-container > .bar").exists()).toBe(true);
    expect(wrapper.find(".vc-widget__slot").exists()).toBe(false);
  });

  it("replaces the five body placeholders with default content", () => {
    const wrapper = mountSkeleton({}, {}, { default: '<i class="bar" />' });

    expect(wrapper.findAll(".vc-widget__slot .vc-widget-skeleton__slot > *")).toHaveLength(1);
    expect(wrapper.find(".vc-widget-skeleton__slot > .bar").exists()).toBe(true);
  });

  it("puts footer-container content into the widget's footer container", () => {
    const wrapper = mountSkeleton({}, {}, { "footer-container": '<i class="bar" />' });

    expect(wrapper.find(".vc-widget__footer-container > .vc-widget-skeleton__footer-container > .bar").exists()).toBe(
      true,
    );
  });

  it("draws the footer from a footer slot without foot", () => {
    const wrapper = mountSkeleton({}, {}, { footer: '<i class="bar" />' });

    expect(wrapper.find(".vc-widget__footer > .vc-widget-skeleton__footer > .bar").exists()).toBe(true);
  });
});
