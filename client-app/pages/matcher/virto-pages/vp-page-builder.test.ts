import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import VPPageBuilder from "./vp-page-builder.vue";
import type { Ref } from "vue";

const routePath = ref("/page-a");
const routeHash = ref("#text2");

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get path() {
      return routePath.value;
    },
    get hash() {
      return routeHash.value;
    },
  }),
}));

vi.mock("@/core/composables", () => ({
  useBreadcrumbs: () => [],
}));

const { scrollToAnchor, usePageSeoInfo } = vi.hoisted(() => ({
  scrollToAnchor: vi.fn(() => Promise.resolve(true)),
  usePageSeoInfo: vi.fn(),
}));

vi.mock("@/shared/static-content/anchors", async () => {
  const actual = await vi.importActual<typeof import("@/shared/static-content/anchors")>(
    "@/shared/static-content/anchors",
  );

  return { ...actual, scrollToAnchor };
});

vi.mock("@/shared/static-content", async () => {
  const anchors = await import("@/shared/static-content/anchors");
  const { useAnchorScroll } = await import("@/shared/static-content/composables/useAnchorScroll");
  const { default: PageBuilderSection } = await import("@/shared/static-content/components/page-builder-section.vue");
  const { registerPageBuilderSections } = await import("@/shared/static-content/sections");
  const { defineComponent, h } = await import("vue");
  const section = defineComponent({ props: { title: String }, setup: (props) => () => h("section", props.title) });
  const PageTemplate = defineComponent({
    setup:
      (_props, { slots }) =>
      () =>
        slots.default?.(),
  });
  registerPageBuilderSections({ "test-block": section });

  return { ...anchors, useAnchorScroll, usePageSeoInfo, PageBuilderSection, PageTemplate };
});

const mountedWrappers: Array<{ unmount: () => void }> = [];

afterEach(() => {
  mountedWrappers.splice(0).forEach((wrapper) => wrapper.unmount());
});

describe("VPPageBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routePath.value = "/page-a";
    routeHash.value = "#text2";
  });

  it("re-parses the content it is handed on a client-side navigation", async () => {
    const wrapper = mountPageBuilder(pageContent("text2"));

    await wrapper.setProps({ content: pageContent("text9") });

    expect(wrapper.find("#text9").exists()).toBe(true);
    expect(wrapper.find("#text2").exists()).toBe(false);
  });

  it("scrolls to the hash once the content of the new page is in", async () => {
    const wrapper = mountPageBuilder(pageContent("text2"));
    scrollToAnchor.mockClear();

    routePath.value = "/page-b";
    await flushPromises();

    expect(scrollToAnchor).not.toHaveBeenCalled();

    await wrapper.setProps({ content: pageContent("text2", { name: "page-b" }) });

    expect(scrollToAnchor).toHaveBeenCalledWith("#text2");
  });

  it("renders the authored anchor after replacing the page content", async () => {
    const wrapper = mountPageBuilder(pageContent("cached"));

    await wrapper.setProps({
      content: JSON.stringify({
        settings: { hideBreadcrumbs: true },
        content: [{ id: "network", type: "test-block", anchor: "Product Details" }],
      }),
    });

    expect(wrapper.find("#cached").exists()).toBe(false);
    expect(wrapper.find("#product-details").exists()).toBe(true);
    expect(wrapper.find("#network").exists()).toBe(false);
  });

  it("replaces cached content when the network document arrives", async () => {
    const wrapper = mountPageBuilder(pageContent("cached"));

    expect(wrapper.find("#cached").exists()).toBe(true);

    await wrapper.setProps({ content: pageContent("network") });

    expect(wrapper.find("#cached").exists()).toBe(false);
    expect(wrapper.find("#network").exists()).toBe(true);
  });

  it.each([undefined, "", "{", "{}", JSON.stringify({ settings: {}, content: {} })])(
    "clears stale content when the latest payload is %s",
    async (content) => {
      const wrapper = mountPageBuilder(pageContent("stale"));
      expect(wrapper.find("#stale").exists()).toBe(true);

      await wrapper.setProps({ content });

      expect(wrapper.find("#stale").exists()).toBe(false);
      expect(wrapper.html()).not.toContain("section");
    },
  );

  it("does not render a section of an unregistered type", () => {
    const wrapper = mountPageBuilder(
      JSON.stringify({ settings: { hideBreadcrumbs: true }, content: [{ id: "unknown", type: "iframe" }] }),
    );

    expect(wrapper.find("#unknown").exists()).toBe(false);
    expect(wrapper.find("iframe").exists()).toBe(false);
  });

  it("passes only declared settings to a section", () => {
    const wrapper = mountPageBuilder(
      JSON.stringify({
        settings: { hideBreadcrumbs: true },
        content: [{ id: "known", type: "test-block", title: "Title", onmouseover: "alert(1)", style: "color: red" }],
      }),
    );

    const section = wrapper.find("#known");
    expect(section.text()).toBe("Title");
    expect(section.attributes("onmouseover")).toBeUndefined();
    expect(section.attributes("style")).toBeUndefined();
  });

  it("recovers when a valid document follows an invalid update", async () => {
    const wrapper = mountPageBuilder("invalid-json");
    expect(wrapper.html()).not.toContain("section");

    await wrapper.setProps({ content: pageContent("recovered") });
    await nextTick();

    expect(wrapper.find("#recovered").exists()).toBe(true);
  });

  it("gives a document that does not parse the full layout, so the header does not wait for it", () => {
    usePageLayout().setPageLayout("blank");

    mountPageBuilder("invalid-json");

    expect(usePageLayout().pageLayout.value).toBe("full");
  });

  it("gives the head the page's SEO info, named by its live name", async () => {
    const wrapper = mountPageBuilder(
      pageContent("seo", { name: "Old name", seoInfo: { pageTitle: "Spring sale" } }),
      "spring-sale",
    );
    const [seoInfo, fallbackTitle] = usePageSeoInfo.mock.calls[0] as [() => unknown, Ref<string>];

    expect(seoInfo()).toEqual({ pageTitle: "Spring sale" });
    expect(fallbackTitle.value).toBe("Spring sale");

    await wrapper.setProps({ content: pageContent("seo", { seoInfo: { metaDescription: "Next page" } }) });

    expect(seoInfo()).toEqual({ metaDescription: "Next page" });
  });
});

function mountPageBuilder(content?: string, name?: string) {
  const wrapper = mount(VPPageBuilder, {
    props: { content, name },
    global: {
      stubs: {
        VcBreadcrumbs: true,
        VcTypography: true,
      },
    },
  });
  mountedWrappers.push(wrapper);
  return wrapper;
}

function pageContent(id: string, settings: Record<string, unknown> = {}): string {
  return JSON.stringify({
    settings: { hideBreadcrumbs: true, ...settings },
    content: [{ id, type: "test-block" }],
  });
}
