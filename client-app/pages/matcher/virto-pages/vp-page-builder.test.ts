import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import VPPageBuilder from "./vp-page-builder.vue";

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

vi.mock("@/core/composables", () => ({ useBreadcrumbs: () => ref([]) }));
vi.mock("@/plugins/builder-preview/block-mapping", () => ({
  getBlockType: (type: string) => (type === "text-block" ? "section" : type),
}));

const { scrollToAnchor } = vi.hoisted(() => ({ scrollToAnchor: vi.fn(() => Promise.resolve(true)) }));

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
  const { getRegisteredSection } = await import("@/shared/static-content/sections");
  const { defineComponent, h } = await import("vue");
  const section = defineComponent({ props: { title: String }, setup: (props) => () => h("section", props.title) });

  return { ...anchors, useAnchorScroll, getRegisteredSection, PageBuilderSection, templateBlocks: { section } };
});

function page(id: string, name = "page-a") {
  return JSON.stringify({ settings: { name }, content: [{ id, type: "text-block" }] });
}

function render(content = page("text2")) {
  return mount(VPPageBuilder, {
    props: { content },
    global: { stubs: { VcBreadcrumbs: true, VcTypography: true } },
  });
}

describe("VPPageBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routePath.value = "/page-a";
    routeHash.value = "#text2";
  });

  it("re-parses the content it is handed on a client-side navigation", async () => {
    const wrapper = render();

    await wrapper.setProps({ content: page("text9") });

    expect(wrapper.find("#text9").exists()).toBe(true);
    expect(wrapper.find("#text2").exists()).toBe(false);
  });

  it("scrolls to the hash once the content of the new page is in", async () => {
    const wrapper = render();
    scrollToAnchor.mockClear();

    routePath.value = "/page-b";
    await flushPromises();

    expect(scrollToAnchor).not.toHaveBeenCalled();

    await wrapper.setProps({ content: page("text2", "page-b") });

    expect(scrollToAnchor).toHaveBeenCalledWith("#text2");
  });

  it("does not render a section of an unregistered type", () => {
    const wrapper = render(
      JSON.stringify({ settings: { hideBreadcrumbs: true }, content: [{ id: "unknown", type: "iframe" }] }),
    );

    expect(wrapper.find("#unknown").exists()).toBe(false);
    expect(wrapper.find("iframe").exists()).toBe(false);
  });

  it("passes only declared settings to a section", () => {
    const wrapper = render(
      JSON.stringify({
        settings: { hideBreadcrumbs: true },
        content: [{ id: "known", type: "text-block", title: "Title", onmouseover: "alert(1)", style: "color: red" }],
      }),
    );

    const section = wrapper.find("#known");
    expect(section.text()).toBe("Title");
    expect(section.attributes("onmouseover")).toBeUndefined();
    expect(section.attributes("style")).toBeUndefined();
  });
});
