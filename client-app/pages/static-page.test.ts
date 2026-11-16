import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import StaticPage from "./static-page.vue";

const staticPage = ref<{ settings: Record<string, unknown>; content: Array<Record<string, unknown>> }>();

vi.mock("@unhead/vue", () => ({ useSeoMeta: vi.fn() }));

vi.mock("@/core/composables", () => ({ useBreadcrumbs: () => [] }));

vi.mock("@/core/composables/usePageTitle", async () => {
  const { ref: vueRef } = await import("vue");
  return { usePageTitle: () => ({ title: vueRef("") }) };
});

vi.mock("@/core/composables/useSeoKeywords", () => ({ useSeoKeywords: vi.fn() }));

vi.mock("@/shared/static-content", async () => {
  const anchors = await import("@/shared/static-content/anchors");
  const { getRegisteredSection } = await import("@/shared/static-content/sections");
  const { default: PageBuilderSection } = await import("@/shared/static-content/components/page-builder-section.vue");
  const { defineComponent, h } = await import("vue");
  const section = defineComponent({
    props: { title: { type: String, default: undefined } },
    setup: (props) => () => h("section", { "data-test-id": "static-page-test-section" }, props.title),
  });

  return {
    ...anchors,
    getRegisteredSection,
    PageBuilderSection,
    templateBlocks: { "test-block": section },
    useAnchorScroll: vi.fn(),
    useStaticPage: () => ({ staticPage }),
  };
});

function mountStaticPage(content: Array<Record<string, unknown>>) {
  staticPage.value = { settings: { hideBreadcrumbs: true }, content };
  return mount(StaticPage);
}

describe("StaticPage", () => {
  it("renders a registered section with its declared props only", () => {
    const section = mountStaticPage([
      { id: "known", type: "test-block", title: "Title", onmouseover: "alert(1)", style: "color: red" },
    ]).find('[data-test-id="static-page-test-section"]');

    expect(section.text()).toBe("Title");
    expect(section.attributes("onmouseover")).toBeUndefined();
    expect(section.attributes("style")).toBeUndefined();
  });

  it.each(["iframe", "toString", "constructor"])("renders nothing for the section type %s", (type) => {
    const wrapper = mountStaticPage([{ id: "unknown", type }]);

    expect(wrapper.find("#unknown").exists()).toBe(false);
    expect(wrapper.text()).toBe("");
  });
});
