import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { getBlockRegistry, registerBlock } from "../layout/registry";
import LayoutSurface from "./layout-surface.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";
import VcWidgetSkeleton from "@/ui-kit/components/organisms/widget-skeleton/vc-widget-skeleton.vue";

const apolloMock = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  return {
    result: shallowRef<unknown>(undefined),
    loading: ref(false),
    error: ref<Error | undefined>(),
    mutate: vi.fn(),
  };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({
    result: apolloMock.result,
    loading: apolloMock.loading,
    error: apolloMock.error,
    onError: vi.fn(),
  }),
  useMutation: () => ({ mutate: apolloMock.mutate, loading: apolloMock.loading }),
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
  },
}));

// Registered rather than reusing a shipped widget: those are async imports that pull their own queries
// in, and all that matters here is what the surface hands a block.
const PROBE_ID = "probe";
let seen: Record<string, unknown> = {};

const Probe = defineComponent({
  inheritAttrs: false,

  setup(_props, { attrs }) {
    seen = { ...attrs };
    return () => h("div", { class: "probe" });
  },
});

registerBlock("customerProfile", {
  id: PROBE_ID,
  region: "mainRight",
  titleKey: "probe.title",
  order: 99,
  component: Probe,
});

// Every mount attaches to document.body, and jsdom is reset per file rather than per test.
enableAutoUnmount(afterEach);

beforeEach(() => {
  seen = {};
  apolloMock.loading.value = false;
  // Never saved: the surface reconciles registry defaults, so every block starts visible.
  apolloMock.result.value = { salesRepLayout: null };
});

function mountSurface(props: Record<string, unknown> = {}) {
  return mount(LayoutSurface, {
    props: { scope: "customerProfile" as const, cards: [], ...props },
    attachTo: document.body,
    // The ui-kit plugin registers these globally and no test boots it. VcButton must be the real one —
    // the edit toggle is a VcButton, and a stub would not carry its click.
    global: {
      components: { VcButton, VcWidget, VcWidgetSkeleton },
      stubs: { VcIcon: true, VcShape: true, VcAlert: true, VcLoaderOverlay: true },
    },
  });
}

describe("LayoutSurface block bindings", () => {
  // The customer profile's only per-surface prop; losing it renders every block for the wrong customer.
  it("passes organizationId to every block alongside the registry's own props", async () => {
    mountSurface({ organizationId: "org-42" });
    await flushPromises();

    expect(seen.organizationId).toBe("org-42");
  });

  // Which is what a shared widget's optional `organizationId` means: the cross-customer dashboard.
  it("leaves it unset on a surface that names no customer", async () => {
    mountSurface();
    await flushPromises();

    expect(seen.organizationId).toBeUndefined();
  });
});

// The skeleton stands in for boxes about to be replaced by real ones, so it uses the kit's own widget
// skeleton and the real stat card rather than re-drawing them — the only way its height cannot drift.
describe("LayoutSurface while the layout query is in flight", () => {
  function mountLoading() {
    apolloMock.result.value = undefined;
    apolloMock.loading.value = true;
    return mountSurface();
  }

  it("draws each block with the kit's skeleton and the real card box, and no blocks of its own", () => {
    const wrapper = mountLoading();
    const registered = getBlockRegistry("customerProfile");
    const widgets = registered.filter((block) => block.region !== "statistics" && !block.defaultHidden);
    const stats = registered.filter((block) => block.region === "statistics" && !block.defaultHidden);

    expect(wrapper.findAll(".layout-skeleton .vc-widget-skeleton")).toHaveLength(widgets.length);
    expect(wrapper.findAll(".layout-skeleton .stat-widget")).toHaveLength(stats.length);
    // Nothing sortable renders until the saved arrangement is known.
    expect(wrapper.find("[data-block-id]").exists()).toBe(false);
  });
});

describe("LayoutSurface edit-button placement", () => {
  it("tucks the button into the main column on desktop", async () => {
    const wrapper = mountSurface({ editButtonPlacement: "mainColumn" });
    await flushPromises();

    expect(wrapper.find(".layout-surface__main-col .layout-edit-button").exists()).toBe(true);
  });

  it("puts it after the whole layout otherwise", async () => {
    const wrapper = mountSurface();
    await flushPromises();

    expect(wrapper.find(".layout-edit-button").exists()).toBe(true);
    expect(wrapper.find(".layout-surface__main-col .layout-edit-button").exists()).toBe(false);
  });
});

// Hiding the last rail widget unmounts the whole column, which is intended — an empty `aside` would
// otherwise hold its desktop width open — but it must not lose the blocks or the way back.
describe("LayoutSurface with an emptied rail", () => {
  // Seeded from a saved document rather than by clicking each ✕: a hidden block never renders, so this
  // needs none of the shipped widgets' async imports.
  async function mountWithHiddenRail() {
    const railBlocks = ["actions", "info", "search_history", "browse_history", PROBE_ID].map((type) => ({
      type,
      hidden: true,
    }));
    apolloMock.result.value = { salesRepLayout: { regions: [{ blocks: railBlocks }] } };

    const wrapper = mountSurface();
    await flushPromises();
    await wrapper.find("[data-layout-edit-toggle]").trigger("click");
    await flushPromises();

    return wrapper;
  }

  it("does not mount the rail at all, and offers every widget back through the tray", async () => {
    const wrapper = await mountWithHiddenRail();

    expect(wrapper.find(".layout-surface__aside").exists()).toBe(false);
    expect(wrapper.find(`[data-restore-id="${PROBE_ID}"]`).exists()).toBe(true);
  });

  it("brings the rail back when a widget is restored", async () => {
    const wrapper = await mountWithHiddenRail();

    await wrapper.find(`[data-restore-id="${PROBE_ID}"]`).trigger("click");
    await flushPromises();

    expect(wrapper.find(".layout-surface__aside").exists()).toBe(true);
    expect(wrapper.find(".layout-surface__aside .probe").exists()).toBe(true);
  });
});
