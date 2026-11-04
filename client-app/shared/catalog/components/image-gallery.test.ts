import { shallowMount } from "@vue/test-utils";
import { Swiper } from "swiper/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ImageGallery from "./image-gallery.vue";
import type { ImageType } from "@/core/api/graphql/types";
import type { VueWrapper } from "@vue/test-utils";

vi.mock("tw-elements", () => ({ initTE: vi.fn(), Lightbox: {} }));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useBreakpoints: () => ({ greaterOrEqual: () => ref(true) }),
}));

function images(count: number): ImageType[] {
  return Array.from({ length: count }, (_, index) => ({ id: `${index}`, url: `/${index}.png` }) as ImageType);
}

let mounted: VueWrapper | undefined;

// Attached, so the `#id …` selectors Swiper gets resolve as they do on the page.
function mountGallery(count: number) {
  mounted = shallowMount(ImageGallery, {
    props: { images: images(count) },
    global: { mocks: { $t: (key: string) => key } },
    attachTo: document.body,
  });

  return mounted;
}

function thumbs(wrapper: VueWrapper) {
  return wrapper.findAllComponents(Swiper).find((swiper) => swiper.classes("image-gallery__thumbs"))!;
}

describe("ImageGallery thumbs", () => {
  afterEach(() => {
    mounted?.unmount();
  });

  it.each([4, 5])("leaves hiding the thumb buttons to Swiper's lock class with %i images", (count) => {
    const wrapper = mountGallery(count);
    const navigation = thumbs(wrapper).props("navigation") as { prevEl: string; nextEl: string; lockClass: string };
    const buttons = wrapper.findAll(".image-gallery__nav");

    expect(navigation.lockClass).toBe("image-gallery__nav--locked");
    expect(buttons).toHaveLength(2);
    expect(document.querySelector(navigation.prevEl)).toBe(buttons[0].element);
    expect(document.querySelector(navigation.nextEl)).toBe(buttons[1].element);
    expect(buttons.every((button) => button.isVisible())).toBe(true);
  });

  it.each([
    [4, false],
    [5, true],
  ])("with %i images, loops the thumbs: %s", (count, loop) => {
    expect(thumbs(mountGallery(count)).props("loop")).toBe(loop);
  });
});
