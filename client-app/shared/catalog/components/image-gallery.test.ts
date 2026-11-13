import { mount } from "@vue/test-utils";
import { Swiper } from "swiper/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

function mountGallery(count: number) {
  mounted = mount(ImageGallery, {
    props: { images: images(count) },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { VcIcon: true, VcImage: true, VcNavButton: true, VcCarouselPagination: true },
    },
    attachTo: document.body,
  });

  return mounted;
}

function thumbs(wrapper: VueWrapper) {
  return wrapper.findAllComponents(Swiper).find((swiper) => swiper.classes("image-gallery__thumbs"))!;
}

describe("ImageGallery thumbs", () => {
  beforeEach(() => {
    // jsdom lays nothing out; Swiper sizes the slides from the strip's width.
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(400);
  });

  afterEach(() => {
    mounted?.unmount();
    vi.restoreAllMocks();
  });

  it.each([
    [4, true],
    [5, false],
  ])("with %i images, Swiper locks the thumb buttons: %s", (count, locked) => {
    const buttons = mountGallery(count).findAll("[data-nav-prev], [data-nav-next]");

    expect(buttons).toHaveLength(2);
    expect(buttons.map((button) => button.classes("image-gallery__nav--locked"))).toEqual([locked, locked]);
  });

  it.each([
    [4, false],
    [5, true],
  ])("with %i images, loops the thumbs: %s", (count, loop) => {
    expect(thumbs(mountGallery(count)).props("loop")).toBe(loop);
  });
});
