import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PageBuilderSection from "./page-builder-section.vue";
import PageBuilderSections from "./page-builder-sections.vue";

function mountSections(props: InstanceType<typeof PageBuilderSections>["$props"]) {
  return shallowMount(PageBuilderSections, { props });
}

describe("PageBuilderSections", () => {
  it("renders a section per item with its anchor id", () => {
    const wrapper = mountSections({
      items: [
        { id: "s1", type: "banner", anchor: "Spring Sale" },
        { id: "s2", type: "text-block" },
      ],
    });

    const sections = wrapper.findAllComponents(PageBuilderSection);
    expect(sections.map((section) => section.props("item").id)).toEqual(["s1", "s2"]);
    expect(sections.map((section) => section.attributes("id"))).toEqual(["spring-sale", "s2"]);
  });

  it("passes the context and the lazy flag to every section", () => {
    const context = { product: { id: "p1" } };
    const wrapper = mountSections({ items: [{ id: "s1" }, { id: "s2" }], context, lazy: true });

    const sections = wrapper.findAllComponents(PageBuilderSection);
    expect(sections.map((section) => section.props("context"))).toEqual([context, context]);
    expect(sections.map((section) => section.props("lazy"))).toEqual([true, true]);
  });

  it("skips hidden items", () => {
    const wrapper = mountSections({ items: [{ id: "s1", hidden: true }, { id: "s2" }] });

    expect(wrapper.findAllComponents(PageBuilderSection).map((section) => section.props("item").id)).toEqual(["s2"]);
  });

  it.each([[[]], [[{ id: "s1", hidden: true }]]])("renders nothing without visible items (%j)", (items) => {
    expect(mountSections({ items }).html()).toBe("<!--v-if-->");
  });
});
