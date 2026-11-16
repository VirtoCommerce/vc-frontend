import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { uiKitOptionsKey } from "@/ui-kit/composables/useUiKitOptions";
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
    expect(mountImage().get("img").attributes("src")).toBe(SRC);
  });

  it("appends the size suffix when thumbnails are enabled", () => {
    const wrapper = mountImage({ image: { thumbnails: () => ({ enabled: true, suffixes: SUFFIXES }) } });

    expect(wrapper.get("img").attributes("src")).toBe("https://cdn.example.com/catalog/phone_md.png");
  });

  it("falls back to the original image when the thumbnail fails and the fallback is enabled", async () => {
    const wrapper = mountImage({
      image: { thumbnails: { enabled: true, originalFallbackEnabled: true, suffixes: SUFFIXES } },
    });

    await wrapper.get("img").trigger("error");

    expect(wrapper.get("img").attributes("src")).toBe(SRC);
  });
});
