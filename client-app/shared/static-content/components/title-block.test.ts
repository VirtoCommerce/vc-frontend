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
});
