import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h, ref, shallowRef } from "vue";
import { useAnchorScroll } from "./useAnchorScroll";
import type { App } from "vue";

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

const { scrollToAnchor, cancelAnchorScroll } = vi.hoisted(() => ({
  scrollToAnchor: vi.fn(() => Promise.resolve(true)),
  cancelAnchorScroll: vi.fn(),
}));

vi.mock("../anchors", () => ({ scrollToAnchor, cancelAnchorScroll }));

const mounted: App[] = [];

function mountPage(content?: () => unknown): App {
  const app = createApp(
    defineComponent({
      setup() {
        useAnchorScroll(content);
        return () => h("div");
      },
    }),
  );
  app.mount(document.createElement("div"));
  mounted.push(app);

  return app;
}

describe("useAnchorScroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routePath.value = "/page-a";
    routeHash.value = "#text2";
  });

  afterEach(() => {
    mounted.splice(0).forEach((app) => app.unmount());
  });

  it("scrolls to the hash the page was opened with", () => {
    mountPage();

    expect(scrollToAnchor).toHaveBeenCalledWith("#text2");
  });

  it("scrolls again when only the hash changes", async () => {
    const content = shallowRef({ id: "page-a" });
    mountPage(() => content.value);

    routeHash.value = "#text5";
    await flushPromises();

    expect(scrollToAnchor).toHaveBeenLastCalledWith("#text5");
  });

  it("holds the scroll back until the content of the new page is rendered", async () => {
    const content = shallowRef({ id: "page-a" });
    mountPage(() => content.value);
    scrollToAnchor.mockClear();

    routePath.value = "/page-b";
    await flushPromises();

    expect(scrollToAnchor).not.toHaveBeenCalled();
    expect(cancelAnchorScroll).toHaveBeenCalled();

    content.value = { id: "page-b" };
    await flushPromises();

    expect(scrollToAnchor).toHaveBeenCalledWith("#text2");
  });

  it("keeps waiting when the hash changes before the new page's content is in", async () => {
    const content = shallowRef({ id: "page-a" });
    mountPage(() => content.value);
    scrollToAnchor.mockClear();

    routePath.value = "/page-b";
    await flushPromises();

    routeHash.value = "#text9";
    await flushPromises();

    expect(scrollToAnchor).not.toHaveBeenCalled();

    content.value = { id: "page-b" };
    await flushPromises();

    expect(scrollToAnchor).toHaveBeenCalledWith("#text9");
  });

  it("scrolls right away on a path change when the page tracks no content", async () => {
    mountPage();
    scrollToAnchor.mockClear();

    routePath.value = "/page-b";
    await flushPromises();

    expect(scrollToAnchor).toHaveBeenCalledWith("#text2");
  });

  it("cancels a pending wait when the page goes away", () => {
    mountPage().unmount();

    expect(cancelAnchorScroll).toHaveBeenCalled();
  });
});
