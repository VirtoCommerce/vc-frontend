import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
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
});
