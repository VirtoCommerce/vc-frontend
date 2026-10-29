import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcShape from "./vc-shape.vue";

function mountShape(props: InstanceType<typeof VcShape>["$props"] = {}) {
  return mount(VcShape, { props, global: { stubs: { VcIcon: true } } });
}

describe("VcShape mask", () => {
  it("leaves the mask to CSS when no mask is passed", () => {
    expect(mountShape({ icon: "cube" }).attributes("style")).not.toContain("mask-image");
  });

  it("writes an explicit mask inline, so it wins over the --vc-shape-mask-image token", () => {
    expect(mountShape({ mask: "polygon" }).attributes("style")).toMatch(/mask-image: url\("[^"]*\/polygon\.svg"\)/);
  });
});
