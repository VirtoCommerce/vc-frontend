import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { uiKitOptionsKey } from "@/ui-kit/composables/useUiKitOptions";
import { NO_IMAGE_URL } from "@/ui-kit/constants";
import VcImage from "./vc-image.vue";
import type { IUiKitOptions } from "@/ui-kit/composables/useUiKitOptions";

const SRC = "https://cdn.example.com/catalog/phone.png";
const SUFFIXES = { sm: "sm", md: "md", lg: "lg" };

function mountImage(options?: IUiKitOptions) {
  return mount(VcImage, {
    props: { src: SRC, sizeSuffix: "md" },
    global: { provide: options ? { [uiKitOptionsKey]: options } : {} },
  });
}

describe("VcImage thumbnails", () => {
  it("shows src as is when the app passes no image options", () => {
    expect(mountImage().attributes("src")).toBe(SRC);
  });

  it("appends the size suffix when thumbnails are enabled", () => {
    const wrapper = mountImage({ image: { thumbnails: () => ({ enabled: true, suffixes: SUFFIXES }) } });

    expect(wrapper.attributes("src")).toBe("https://cdn.example.com/catalog/phone_md.png");
  });

  it("falls back to the original image when the thumbnail fails and the fallback is enabled", async () => {
    const wrapper = mountImage({
      image: { thumbnails: { enabled: true, originalFallbackEnabled: true, suffixes: SUFFIXES } },
    });

    await wrapper.trigger("error");

    expect(wrapper.attributes("src")).toBe(SRC);
  });

  it("shows src as is when thumbnails are disabled", () => {
    const wrapper = mountImage({ image: { thumbnails: { enabled: false, suffixes: SUFFIXES } } });

    expect(wrapper.attributes("src")).toBe(SRC);
  });

  it("shows the fallback image when the thumbnail fails and the original fallback is disabled", async () => {
    const wrapper = mountImage({ image: { thumbnails: { enabled: true, suffixes: SUFFIXES } } });

    await wrapper.trigger("error");

    expect(wrapper.classes()).toContain("vc-image--fallback");
    expect(wrapper.attributes("src")).not.toBe(SRC);
  });

  it("shows the fallback image when the original image fails too", async () => {
    const wrapper = mountImage({
      image: { thumbnails: { enabled: true, originalFallbackEnabled: true, suffixes: SUFFIXES } },
    });

    await wrapper.trigger("error");
    await wrapper.trigger("error");

    expect(wrapper.classes()).toContain("vc-image--fallback");
  });
});

describe("VcImage fallback", () => {
  it("shows ui-kit's own no-image without src", () => {
    const wrapper = mount(VcImage);

    expect(wrapper.attributes("src")).toBe(NO_IMAGE_URL);
  });

  const BRANDED = "https://cdn.example.com/brand/no-image.svg";
  const branded: IUiKitOptions = { image: { fallbackSrc: () => BRANDED } };

  it("shows the plugin's fallback without src", () => {
    const wrapper = mount(VcImage, { global: { provide: { [uiKitOptionsKey]: branded } } });

    expect(wrapper.attributes("src")).toBe(BRANDED);
  });

  it("shows the plugin's fallback in a VcImage another component renders", () => {
    const Host = defineComponent(() => () => h("div", [h(VcImage, { src: "" })]));
    const wrapper = mount(Host, { global: { provide: { [uiKitOptionsKey]: branded } } });

    expect(wrapper.findComponent(VcImage).attributes("src")).toBe(BRANDED);
  });

  it("shows the plugin's fallback when src fails to load", async () => {
    const wrapper = mount(VcImage, { props: { src: SRC }, global: { provide: { [uiKitOptionsKey]: branded } } });

    await wrapper.trigger("error");

    expect(wrapper.attributes("src")).toBe(BRANDED);
  });

  it("prefers the instance's fallbackSrc to the plugin's", () => {
    const own = "https://cdn.example.com/brand/no-photo.svg";
    const wrapper = mount(VcImage, {
      props: { fallbackSrc: own },
      global: { provide: { [uiKitOptionsKey]: branded } },
    });

    expect(wrapper.attributes("src")).toBe(own);
  });
});

describe("VcImage file names", () => {
  const resolving: IUiKitOptions = { image: { resolveFileName: (fileName) => `/app-images/${fileName}` } };

  it("turns a bare src file name into a URL with the plugin's resolveFileName", () => {
    const wrapper = mount(VcImage, {
      props: { src: "visa.svg" },
      global: { provide: { [uiKitOptionsKey]: resolving } },
    });

    expect(wrapper.attributes("src")).toBe("/app-images/visa.svg");
  });

  it("turns a bare fallbackSrc file name into a URL with the plugin's resolveFileName", () => {
    const wrapper = mount(VcImage, {
      props: { fallbackSrc: "no-photo.svg" },
      global: { provide: { [uiKitOptionsKey]: resolving } },
    });

    expect(wrapper.attributes("src")).toBe("/app-images/no-photo.svg");
  });

  it("shows a bare file name as is when the app passes no resolveFileName", () => {
    expect(mount(VcImage, { props: { src: "visa.svg" } }).attributes("src")).toBe("visa.svg");
  });
});
