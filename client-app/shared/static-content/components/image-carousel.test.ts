import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ImageCarousel from "./image-carousel.vue";

const SliderStub = {
  name: "Slider",
  props: ["slides", "title", "subtitle", "height"],
  template: "<div />",
};

function mountCarousel(props: Record<string, unknown>) {
  return mount(ImageCarousel, { props, global: { stubs: { Slider: SliderStub } } }).findComponent(SliderStub);
}

describe("ImageCarousel", () => {
  it("renders one slide per selected image", () => {
    const slider = mountCarousel({ images: ["/a.png", "/b.png", "/c.png"] });

    expect(slider.props("slides")).toEqual([{ image: "/a.png" }, { image: "/b.png" }, { image: "/c.png" }]);
  });

  it("accepts asset objects and skips empty values", () => {
    const slider = mountCarousel({ images: [{ url: "/a.png" }, "", { url: "" }, "/b.png"] });

    expect(slider.props("slides")).toEqual([{ image: "/a.png" }, { image: "/b.png" }]);
  });

  it("passes title, subtitle and height to the slider", () => {
    const slider = mountCarousel({ images: [], title: "Title", subtitle: "Subtitle", height: "large" });

    expect(slider.props()).toMatchObject({ slides: [], title: "Title", subtitle: "Subtitle", height: "large" });
  });
});
