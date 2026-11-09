import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { registerPageBuilderSections } from "@/shared/static-content/sections";
import StaticPage from "./static-page.vue";

const staticPage = ref<{ settings: Record<string, unknown>; content: Array<Record<string, unknown>> }>();

vi.mock("@unhead/vue", () => ({ useSeoMeta: vi.fn() }));

vi.mock("@/core/composables", () => ({ useBreadcrumbs: () => [] }));

vi.mock("@/core/composables/usePageTitle", async () => {
  const { ref: vueRef } = await import("vue");
  return { usePageTitle: () => ({ title: vueRef("") }) };
});

vi.mock("@/core/composables/useSeoKeywords", () => ({ useSeoKeywords: vi.fn() }));

vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/page" }) }));

vi.mock("@/shared/static-content", async () => {
  const anchors = await import("@/shared/static-content/anchors");
  const { default: PageBuilderSection } = await import("@/shared/static-content/components/page-builder-section.vue");
  const { defineComponent: define, ref: vueRef } = await import("vue");

  return {
    ...anchors,
    PageBuilderSection,
    PageTemplate: define({
      setup:
        (_, { slots }) =>
        () =>
          slots.default?.(),
    }),
    useAnchorScroll: vi.fn(),
    useStaticPage: () => ({ staticPage, staticPagePreviewSubject: vueRef() }),
  };
});

const TestSection = defineComponent({
  props: { title: { type: String, default: undefined } },
  setup: (props) => () => h("section", { "data-test-id": "static-page-test-section" }, props.title),
});

function mountStaticPage(content: Array<Record<string, unknown>>) {
  staticPage.value = { settings: { hideBreadcrumbs: true }, content };
  return mount(StaticPage);
}

describe("StaticPage", () => {
  beforeEach(() => {
    registerPageBuilderSections({ "test-block": TestSection });
  });

  afterEach(() => {
    useExtensionRegistry().unregister("pageBuilderSection", "test-block");
  });

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
