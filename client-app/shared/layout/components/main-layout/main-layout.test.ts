import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, onMounted } from "vue";
import type { Component } from "vue";

const { flag, stub } = vi.hoisted(() => ({
  flag: { enabled: true },
  stub: async (testId: string) => {
    const { defineComponent: define, h: render } = await import("vue");
    return { default: define({ setup: () => () => render("div", { "data-test-id": testId }) }) };
  },
}));

vi.mock("@/core/theme-snapshot", () => ({ isNewPageBuilderEnabled: () => flag.enabled }));
vi.mock("@/shared/layout/components/header/vc-header.vue", () => stub("full-header"));
vi.mock("@/shared/layout/components/footer/vc-footer.vue", () => stub("full-footer"));
vi.mock("@/shared/layout/components/minimal-header/minimal-header.vue", () => stub("minimal-header"));
vi.mock("@/shared/layout/components/skip-to-links/skip-to-links.vue", () => stub("skip-to-links"));

const pageMounted = vi.fn();
const Page = defineComponent({
  setup() {
    onMounted(pageMounted);
    return () => h("article", { "data-test-id": "page" });
  },
});

/** A fresh layout state for every test: the page layout is app-wide. */
async function loadLayout() {
  vi.resetModules();
  const { usePageLayout } = await import("@/shared/layout/composables/usePageLayout");
  const MainLayout = ((await import("./main-layout.vue")) as { default: Component }).default;

  return {
    ...usePageLayout(),
    mountLayout: () => mount(MainLayout, { slots: { default: () => h(Page) } }),
  };
}

function chrome(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper
    .findAll("[data-test-id]")
    .map((node) => node.attributes("data-test-id") ?? "")
    .filter((id) => id !== "skip-to-links" && id !== "page");
}

describe("MainLayout", () => {
  beforeEach(() => {
    flag.enabled = true;
    pageMounted.mockClear();
  });

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

  it("keeps the full layout without the new Page Builder", async () => {
    flag.enabled = false;
    const { setPageLayout, mountLayout } = await loadLayout();
    setPageLayout("blank");

    const wrapper = mountLayout();
    await nextTick();

    expect(chrome(wrapper)).toEqual(["full-header", "full-footer"]);
  });
});
