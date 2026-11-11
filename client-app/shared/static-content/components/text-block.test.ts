import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TextBlock from "./text-block.vue";

function mountTextBlock(props: Record<string, unknown>) {
  return mount(TextBlock, { props: { title: "Title", heading: "h2", text: "", ...props } });
}

describe("TextBlock", () => {
  it("renders the heading tag from the list", () => {
    expect(mountTextBlock({ heading: "h3" }).find("h3").text()).toBe("Title");
  });

  it("falls back to h2 for a heading outside the list", () => {
    const wrapper = mountTextBlock({ heading: "script" });

    expect(wrapper.find("script").exists()).toBe(false);
    expect(wrapper.find("h2").text()).toBe("Title");
  });

  it.each([undefined, "", "   "])("renders no heading for the title %j", (title) => {
    expect(mountTextBlock({ title }).find("h1, h2, h3, h4, h5, h6").exists()).toBe(false);
  });

  it("sanitizes the text HTML", () => {
    const wrapper = mountTextBlock({
      text: { html: '<p>Hi</p><img src="x.png" onerror="alert(1)"><iframe></iframe>' },
    });

    expect(wrapper.find(".block-content").html()).toContain('<p>Hi</p><img src="x.png">');
    expect(wrapper.find("iframe").exists()).toBe(false);
  });
});
