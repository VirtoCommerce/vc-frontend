import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcWidget from "./vc-widget.vue";

function mountWidget(props: InstanceType<typeof VcWidget>["$props"] = {}) {
  return mount(VcWidget, {
    props: { title: "Orders", ...props },
    slots: { default: "Body" },
    global: { stubs: { VcIcon: true, VcShape: true } },
  });
}

describe("VcWidget seamless", () => {
  it("draws its plate by default", () => {
    expect(mountWidget().classes()).not.toContain("vc-widget--seamless");
  });

  it("marks a seamless widget with its modifier", () => {
    expect(mountWidget({ seamless: true }).classes()).toContain("vc-widget--seamless");
  });

  it("keeps the header and the body of a seamless widget", () => {
    const wrapper = mountWidget({ seamless: true });

    expect(wrapper.find(".vc-widget__title").text()).toBe("Orders");
    expect(wrapper.find(".vc-widget__slot").text()).toBe("Body");
  });
});
