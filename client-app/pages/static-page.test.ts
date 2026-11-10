import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref, toValue } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { registerPageBuilderSections } from "@/shared/static-content/sections";
import StaticPage from "./static-page.vue";

const staticPage = ref<{ settings: Record<string, unknown>; content: Array<Record<string, unknown>> }>();

const { useElementVisibility, usePageSeoInfo } = vi.hoisted(() => ({
  useElementVisibility: vi.fn(),
  usePageSeoInfo: vi.fn(),
}));

vi.mock("@unhead/vue", () => ({ useSeoMeta: vi.fn() }));

vi.mock("@vueuse/core", async (importOriginal) => {
  const { ref: vueRef } = await import("vue");
  useElementVisibility.mockImplementation(() => vueRef(true));
  return { ...(await importOriginal<typeof import("@vueuse/core")>()), useElementVisibility };
});

vi.mock("@/core/composables", () => ({ useBreadcrumbs: () => [] }));

vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/page" }) }));

vi.mock("@/shared/static-content", async () => {
  const anchors = await import("@/shared/static-content/anchors");
  const { default: PageBuilderSection } = await import("@/shared/static-content/components/page-builder-section.vue");
  const { defineComponent: define, h: render, ref: vueRef } = await import("vue");

  return {
    ...anchors,
    PageBuilderSection,
    PageTemplate: define({
      name: "PageTemplate",
      props: ["pageSettings", "permalink", "objectType"],
      setup:
        (_, { slots }) =>
        () => [
          render("section", { "data-test-id": "template-before-section" }),
          slots.default?.(),
          render("section", { "data-test-id": "template-after-section" }),
        ],
    }),
    useAnchorScroll: vi.fn(),
    usePageSeoInfo,
    useStaticPage: () => ({ staticPage, staticPagePreviewSubject: vueRef() }),
  };
});

const TestSection = defineComponent({
  props: { title: { type: String, default: undefined } },
  setup: (props) => () => h("section", { "data-test-id": "static-page-test-section" }, props.title),
});

function mountStaticPage(content: Array<Record<string, unknown>>, props: { permalink?: string } = {}) {
  staticPage.value = { settings: { hideBreadcrumbs: true }, content };
  return mount(StaticPage, { props });
}

describe("StaticPage", () => {
  beforeEach(() => {
    useElementVisibility.mockClear();
    usePageSeoInfo.mockClear();
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

  it("keeps the page's meta on while any of its template's sections is on screen", () => {
    const wrapper = mountStaticPage([{ id: "known", type: "test-block", title: "Title" }]);
    const anchor = toValue(useElementVisibility.mock.calls[0][0] as HTMLElement | null);

    expect(anchor?.contains(wrapper.find('[data-test-id="template-before-section"]').element)).toBe(true);
    expect(anchor?.contains(wrapper.find('[data-test-id="template-after-section"]').element)).toBe(true);
    expect(usePageSeoInfo).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      useElementVisibility.mock.results[0].value,
    );
  });

  it("gives its template the page's permalink, which the canonical URL is built from, not the visited path", () => {
    const template = mountStaticPage([], { permalink: "/about" }).findComponent({ name: "PageTemplate" });

    expect(template.props("permalink")).toBe("/about");
  });

  it("gives its template the visited path when it has no permalink", () => {
    const template = mountStaticPage([]).findComponent({ name: "PageTemplate" });

    expect(template.props("permalink")).toBe("/page");
  });

  it.each(["iframe", "toString", "constructor"])("renders nothing for the section type %s", (type) => {
    const wrapper = mountStaticPage([{ id: "unknown", type }]);

    expect(wrapper.find("#unknown").exists()).toBe(false);
    expect(wrapper.text()).toBe("");
  });
});
