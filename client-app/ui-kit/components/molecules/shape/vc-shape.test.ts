import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { uiKitOptionsKey } from "@/ui-kit/composables/useUiKitOptions";
import VcShape from "./vc-shape.vue";
import type { IUiKitOptions } from "@/ui-kit/composables/useUiKitOptions";

function mountShape(props: InstanceType<typeof VcShape>["$props"] = {}, options?: IUiKitOptions) {
  return mount(VcShape, {
    props,
    global: { stubs: { VcIcon: true }, provide: options ? { [uiKitOptionsKey]: options } : {} },
  });
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
  it("turns a bare file name into a URL with the plugin's resolveFileName", () => {
    const options: IUiKitOptions = { image: { resolveFileName: (fileName) => `/app-images/${fileName}` } };

    expect(mountShape({ img: "basket.jpg" }, options).attributes("style")).toContain(
      'background-image: url("/app-images/basket.jpg")',
    );
  });

  it("uses a bare file name as is when the app passes no resolveFileName", () => {
    expect(mountShape({ img: "basket.jpg" }).attributes("style")).toContain('background-image: url("basket.jpg")');
  });

  it("uses a URL as is", () => {
    expect(mountShape({ img: "/static/banner.webp" }).attributes("style")).toContain(
      'background-image: url("/static/banner.webp")',
    );
  });
});
