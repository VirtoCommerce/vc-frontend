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
    expect(mountShape({ mask: "circle-mask" }).attributes("style")).toMatch(
      /mask-image: url\("[^"]*\/circle-mask\.svg"\)/,
    );
  });
});

describe("VcShape image", () => {
  it("looks a bare file name up among the app's images", () => {
    expect(mountShape({ img: "basket.jpg" }).attributes("style")).toMatch(
      /background-image: url\("[^"]*\/assets\/images\/basket\.jpg"\)/,
    );
  });

  it("uses a URL as is", () => {
    expect(mountShape({ img: "/static/banner.webp" }).attributes("style")).toContain(
      'background-image: url("/static/banner.webp")',
    );
  });
});
