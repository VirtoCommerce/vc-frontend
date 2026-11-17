import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Slider from "./slider.vue";

function mountSlider(url: string) {
  return mount(Slider, {
    props: { slides: [{ image: "/slide.png", url }] },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        Swiper: { template: "<div><slot /></div>" },
        SwiperSlide: { template: "<div><slot /></div>" },
        VcImage: true,
        VcIcon: true,
        RouterLink: { props: ["to"], template: '<a data-test-id="router-link" :data-to="to"><slot /></a>' },
      },
    },
  });
}

describe("Slider", () => {
  it("links a slide to a relative URL", () => {
    expect(mountSlider("/catalog").find('[data-test-id="router-link"]').attributes("data-to")).toBe("/catalog");
  });

  it("opens an external URL in a new window without an opener", () => {
    const link = mountSlider("https://example.com").find("a");

    expect(link.attributes()).toMatchObject({
      href: "https://example.com",
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it.each(["javascript:alert(1)", "data:text/html,<p>x</p>"])("renders no link for %j", (url) => {
    const wrapper = mountSlider(url);

    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.find(".vc-slider__image-wrap").element.tagName).toBe("DIV");
  });
});
