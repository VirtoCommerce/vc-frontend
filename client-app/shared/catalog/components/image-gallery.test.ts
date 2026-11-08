import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ImageGallery from "./image-gallery.vue";
import type { ImageType } from "@/core/api/graphql/types";

vi.mock("tw-elements", () => ({ initTE: vi.fn(), Lightbox: {} }));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useBreakpoints: () => ({ greaterOrEqual: () => ref(true) }),
}));

function images(count: number): ImageType[] {
  return Array.from({ length: count }, (_, index) => ({ id: `${index}`, url: `/${index}.png` }) as ImageType);
}

function navButtons(count: number) {
  const wrapper = shallowMount(ImageGallery, {
    props: { images: images(count) },
    global: { mocks: { $t: (key: string) => key } },
  });

  return wrapper.findAll("[data-nav-prev], [data-nav-next]");
}

describe("ImageGallery thumbs", () => {
  it("hides the thumb buttons when every thumb fits, as Swiper locks the strip", () => {
    const buttons = navButtons(4);

    expect(buttons).toHaveLength(2);
    expect(buttons.every((button) => !button.isVisible())).toBe(true);
  });

  it("shows the thumb buttons when the thumbs can slide", () => {
    const buttons = navButtons(5);

    expect(buttons).toHaveLength(2);
    expect(buttons.every((button) => button.isVisible())).toBe(true);
  });
});
