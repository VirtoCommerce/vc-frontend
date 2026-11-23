import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, onMounted, reactive } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { focusOrder } from "../layout-test-utils";
import MainLayout from "./main-layout.vue";
import type { Component } from "vue";
import VcFrame from "@/ui-kit/components/templates/frame/vc-frame.vue";

const { flag, headerMounted } = vi.hoisted(() => ({
  flag: { enabled: true, hasNoTheme: false },
  headerMounted: vi.fn(),
}));

vi.mock("vue-router", () => ({ useRoute: () => reactive({ path: "/" }) }));

vi.mock("@/core/theme-snapshot", () => ({
  useThemeSnapshot: () => ({ isThemeApplied: () => flag.enabled && !flag.hasNoTheme }),
}));

vi.mock("@/shared/layout/components/header/app-header.vue", async () => {
  const vue = await import("vue");
  return {
    default: vue.defineComponent({
      name: "AppHeader",
      setup: () => {
        vue.onMounted(headerMounted);
        return () =>
          vue.h("header", { class: "header-stub", "data-test-id": "full-header" }, [vue.h("a", { href: "/" }, "Home")]);
      },
    }),
  };
});

vi.mock("@/shared/layout/components/footer/vc-footer.vue", async () => {
  const vue = await import("vue");
  return {
    default: vue.defineComponent({
      name: "VcFooter",
      setup: () => () => vue.h("footer", { id: "footer", "data-test-id": "full-footer" }),
    }),
  };
});

vi.mock("@/shared/layout/components/minimal-header/minimal-header.vue", async () => {
  const vue = await import("vue");
  return {
    default: vue.defineComponent({ setup: () => () => vue.h("header", { "data-test-id": "minimal-header" }) }),
  };
});

const createWrapper = createWrapperFactory(mount, MainLayout, {
  global: { components: { VcFrame } },
  slots: { default: '<p class="page">page</p>' },
});

enableAutoUnmount(afterEach);

beforeEach(() => {
  flag.enabled = true;
  flag.hasNoTheme = false;
  headerMounted.mockClear();
});

describe("MainLayout", () => {
  beforeEach(() => {
    flag.enabled = false;
  });

  it("renders exactly one main#main-content with the page in it", () => {
    const wrapper = createWrapper();
    const mains = wrapper.findAll("main");

    expect(mains).toHaveLength(1);
    expect(mains[0].attributes("id")).toBe("main-content");
    expect(mains[0].find(".page").exists()).toBe(true);
  });

  it("renders the skip link to #main-content before the main region", () => {
    const wrapper = createWrapper();
    const link = wrapper.get('a[href="#main-content"]');
    const main = wrapper.get("#main-content");

    expect(main.element.tagName).toBe("MAIN");
    expect(link.element.compareDocumentPosition(main.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("puts the skip link first in the header, before the header's own links", () => {
    const wrapper = createWrapper();

    expect(focusOrder(wrapper)).toEqual(["skip-to-links #main-content", "skip-to-links #footer", "a /"]);
  });

  it("puts the footer in the frame's footer element and keeps the header out of main", () => {
    const wrapper = createWrapper();
    const main = wrapper.get("main");

    expect(wrapper.get(".vc-frame__footer").find("#footer").exists()).toBe(true);
    expect(main.find("#footer").exists()).toBe(false);
    expect(wrapper.find(".header-stub").exists()).toBe(true);
    expect(main.find(".header-stub").exists()).toBe(false);
  });
});

describe("MainLayout page layouts", () => {
  const pageMounted = vi.fn();
  const Page = defineComponent({
    setup() {
      onMounted(pageMounted);
      return () => h("article", { "data-test-id": "page" });
    },
  });

  beforeEach(() => {
    pageMounted.mockClear();
  });

  /** A fresh layout state for every test: the page layout is app-wide. */
  async function loadLayout() {
    vi.resetModules();
    const { usePageLayout } = await import("@/shared/layout/composables/usePageLayout");
    const Layout = ((await import("./main-layout.vue")) as { default: Component }).default;

    return {
      ...usePageLayout(),
      mountLayout: () =>
        mount(Layout, {
          global: { components: { VcFrame }, mocks: { $t: (key: string) => key } },
          slots: { default: () => h(Page) },
        }),
    };
  }

  function chrome(wrapper: ReturnType<typeof mount>): string[] {
    return wrapper
      .findAll("[data-test-id]")
      .map((node) => node.attributes("data-test-id") ?? "")
      .filter((id) => id !== "page");
  }

  it("waits with the header and footer until the page's layout is known", async () => {
    const { mountLayout } = await loadLayout();
    const wrapper = mountLayout();
    await nextTick();

    expect(chrome(wrapper)).toEqual([]);
    expect(wrapper.find('[data-test-id="page"]').exists()).toBe(true);
  });

  it.each([
    ["full", ["full-header", "full-footer"]],
    ["minimal", ["minimal-header"]],
    ["blank", []],
  ] as const)("draws the %s layout around the page without remounting it", async (layout, expected) => {
    const { setPageLayout, mountLayout } = await loadLayout();
    setPageLayout("full");
    const wrapper = mountLayout();

    setPageLayout(layout);
    await nextTick();

    expect(chrome(wrapper)).toEqual(expected);
    expect(pageMounted).toHaveBeenCalledOnce();
  });

  it("does not mount the header again when the visitor comes back from a page on another layout", async () => {
    const { setPageLayout, mountLayout } = await loadLayout();
    setPageLayout("full");
    const wrapper = mountLayout();

    setPageLayout("minimal");
    await nextTick();
    setPageLayout("full");
    await nextTick();

    expect(chrome(wrapper)).toEqual(["full-header", "full-footer"]);
    expect(headerMounted).toHaveBeenCalledOnce();
  });

  it("draws the full layout at once for a store without a theme, whatever the page says", async () => {
    flag.hasNoTheme = true;
    const { setPageLayout, mountLayout } = await loadLayout();

    const wrapper = mountLayout();
    await nextTick();
    expect(chrome(wrapper)).toEqual(["full-header", "full-footer"]);

    setPageLayout("minimal");
    await nextTick();
    expect(chrome(wrapper)).toEqual(["full-header", "full-footer"]);
  });

  it("keeps the full layout without Site Builder", async () => {
    flag.enabled = false;
    const { setPageLayout, mountLayout } = await loadLayout();
    setPageLayout("blank");

    const wrapper = mountLayout();
    await nextTick();

    expect(chrome(wrapper)).toEqual(["full-header", "full-footer"]);
  });
});
