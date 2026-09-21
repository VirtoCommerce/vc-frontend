import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
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

vi.mock("@/core/composables", () => ({
  useBreadcrumbs: () => [],
}));

vi.mock("@/plugins/builder-preview/block-mapping", () => ({
  getBlockType: () => "section",
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

  return { ...anchors, useAnchorScroll };
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

  it("recovers when a valid document follows an invalid update", async () => {
    const wrapper = mountPageBuilder("invalid-json");
    expect(wrapper.html()).not.toContain("section");

    await wrapper.setProps({ content: pageContent("recovered") });
    await nextTick();

    expect(wrapper.find("#recovered").exists()).toBe(true);
  });
});

function mountPageBuilder(content?: string) {
  const wrapper = mount(VPPageBuilder, {
    props: { content },
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
