import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TitleBlock from "./title-block.vue";

describe("TitleBlock", () => {
  it("renders the heading tag from the list", () => {
    expect(
      mount(TitleBlock, { props: { title: "Title", heading: "h4" } })
        .find("h4")
        .text(),
    ).toBe("Title");
  });

  it("falls back to h2 for a heading outside the list", () => {
    const wrapper = mount(TitleBlock, { props: { title: "Title", heading: "iframe" } });

    expect(wrapper.find("iframe").exists()).toBe(false);
    expect(wrapper.find("h2").text()).toBe("Title");
  });

  it.each([undefined, "", "   "])("renders no heading for the title %j", (title) => {
    const wrapper = mount(TitleBlock, { props: { title, heading: "h2" } });

    expect(wrapper.find("h1, h2, h3, h4, h5, h6").exists()).toBe(false);
  });
});
