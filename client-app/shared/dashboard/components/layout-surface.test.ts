import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createFakeLayout, registerTestDashboard, TEST_STAT_CARDS } from "../layout-test-utils";
import { getBlockRegistry, registerBlock } from "../registry";
import LayoutSurface from "./layout-surface.vue";
import type { FakeLayoutType } from "../layout-test-utils";
import type { SavedLayoutType } from "../types";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcStatCard from "@/ui-kit/components/molecules/stat-card/vc-stat-card.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";
import VcWidgetSkeleton from "@/ui-kit/components/organisms/widget-skeleton/vc-widget-skeleton.vue";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
  },
}));

const SCOPE = "surfaceSpec";

// Registered on top of the synthetic dashboard: all that matters here is what the surface hands a block.
const PROBE_ID = "probe";
let seen: Record<string, unknown> = {};

const Probe = defineComponent({
  inheritAttrs: false,

  setup(_props, { attrs }) {
    seen = { ...attrs };
    return () => h("div", { class: "probe" });
  },
});

registerTestDashboard(SCOPE);
registerBlock(SCOPE, {
  id: PROBE_ID,
  region: "mainRight",
  titleKey: "probe.title",
  order: 99,
  component: Probe,
  props: { fromRegistry: true },
});

// Every mount attaches to document.body, and jsdom is reset per file rather than per test.
enableAutoUnmount(afterEach);

beforeEach(() => {
  seen = {};
});

function mountSurface(layout: FakeLayoutType, props: Record<string, unknown> = {}) {
  return mount(LayoutSurface, {
    props: { layout, cards: TEST_STAT_CARDS, ...props },
    attachTo: document.body,
    // The ui-kit plugin registers these globally and no test boots it. VcButton must be the real one —
    // the edit toggle is a VcButton, and a stub would not carry its click.
    global: {
      components: { VcButton, VcStatCard, VcWidget, VcWidgetSkeleton },
      stubs: { VcIcon: true, VcShape: true, VcAlert: true, VcLoaderOverlay: true, VcInput: true },
    },
  });
}

describe("LayoutSurface block bindings", () => {
  // The customer profile's organization reaches its widgets this way; losing it renders every block for the
  // wrong customer.
  it("passes the page's blockProps to every block alongside the registry's own props", async () => {
    mountSurface(createFakeLayout(SCOPE), { blockProps: { organizationId: "org-42" } });
    await flushPromises();

    expect(seen).toMatchObject({ organizationId: "org-42", fromRegistry: true });
  });

  it("adds nothing of its own on a surface whose page passes none", async () => {
    mountSurface(createFakeLayout(SCOPE));
    await flushPromises();

    expect(seen).toEqual({ fromRegistry: true });
  });
});

// The skeleton stands in for boxes about to be replaced by real ones, so it uses the kit's own widget
// skeleton and the real stat card rather than re-drawing them — the only way its height cannot drift.
describe("LayoutSurface while the layout is read for the first time", () => {
  function mountLoading() {
    const layout = createFakeLayout(SCOPE);
    layout.loading.value = true;
    return mountSurface(layout);
  }

  it("draws each block with the kit's skeleton and the stat card's placeholder, and no blocks of its own", () => {
    const wrapper = mountLoading();
    const registered = getBlockRegistry(SCOPE);
    const widgets = registered.filter((block) => block.region !== "statistics" && !block.defaultHidden);
    const stats = registered.filter((block) => block.region === "statistics" && !block.defaultHidden);

    expect(wrapper.findAll(".layout-skeleton .vc-widget-skeleton")).toHaveLength(widgets.length);
    expect(wrapper.findAll(".layout-skeleton .vc-stat-card--placeholder")).toHaveLength(stats.length);
    // Nothing sortable renders until the saved arrangement is known.
    expect(wrapper.find("[data-block-id]").exists()).toBe(false);
  });

  // The tile was `stat-widget` before it moved into the ui-kit; selectors outside this repository may still
  // wait on it, skeleton included.
  it("keeps the tile's previous class on every placeholder card", () => {
    const wrapper = mountLoading();

    expect(wrapper.findAll(".layout-skeleton .stat-widget.stat-widget--neutral")).toHaveLength(TEST_STAT_CARDS.length);
  });
});

describe("LayoutSurface stat row", () => {
  it("renders each visible card as a VcStatCard that still carries the tile's previous classes", async () => {
    const wrapper = mountSurface(createFakeLayout(SCOPE));
    await flushPromises();

    const beta = wrapper.get('[data-block-id="beta"] .vc-stat-card');
    expect(beta.classes()).toEqual(expect.arrayContaining(["stat-widget", "stat-widget--success"]));
    expect(beta.classes()).toContain("vc-stat-card--color--success");
  });

  it("marks only the cards whose query failed, with the engine's own message", async () => {
    const cards = TEST_STAT_CARDS.map((card) => (card.key === "gamma" ? { ...card, failed: true } : card));
    const wrapper = mountSurface(createFakeLayout(SCOPE), { cards });
    await flushPromises();

    expect(wrapper.get('[data-block-id="gamma"] .vc-stat-card__error').text()).toBe(
      "shared.dashboard.stats.load_failed",
    );
    expect(wrapper.find('[data-block-id="alpha"] .vc-stat-card__error').exists()).toBe(false);
  });
});

describe("LayoutSurface after a failed read", () => {
  it("says the default arrangement is shown, and offers no edit button", async () => {
    const layout = createFakeLayout(SCOPE);
    layout.loadFailed.value = true;
    const wrapper = mountSurface(layout, { editButtonPlacement: "end" });
    await flushPromises();

    expect(wrapper.find("vc-alert-stub").exists()).toBe(true);
    expect(wrapper.find("[data-layout-edit-toggle]").exists()).toBe(false);
  });
});

describe("LayoutSurface edit-button placement", () => {
  it("tucks the button into the main column on desktop", async () => {
    const wrapper = mountSurface(createFakeLayout(SCOPE), { editButtonPlacement: "mainColumn" });
    await flushPromises();

    expect(wrapper.find(".layout-surface__main-col .layout-edit-button").exists()).toBe(true);
  });

  it("puts it after the whole layout otherwise", async () => {
    const wrapper = mountSurface(createFakeLayout(SCOPE));
    await flushPromises();

    expect(wrapper.find(".layout-edit-button").exists()).toBe(true);
    expect(wrapper.find(".layout-surface__main-col .layout-edit-button").exists()).toBe(false);
  });
});

describe("LayoutSurface while saving", () => {
  // Nothing may change mid-save, keyboard included — the overlay alone would leave the controls focusable.
  it("makes the layout inert", async () => {
    const layout = createFakeLayout(SCOPE);
    const wrapper = mountSurface(layout);
    await flushPromises();
    expect(wrapper.get(".layout-surface__layout").attributes("inert")).toBeUndefined();

    layout.saving.value = true;
    await flushPromises();

    expect(wrapper.get(".layout-surface__layout").attributes("inert")).toBeDefined();
  });
});

// Hiding the last rail widget unmounts the whole column, which is intended — an empty `aside` would
// otherwise hold its desktop width open — but it must not lose the blocks or the way back.
describe("LayoutSurface with an emptied rail", () => {
  // Seeded from a saved document rather than by clicking each ✕: a hidden block never renders.
  async function mountWithHiddenRail() {
    const railBlocks = ["side", "extra", PROBE_ID].map((type) => ({ type, hidden: true }));
    const saved: SavedLayoutType = { regions: [{ blocks: railBlocks }] };

    const wrapper = mountSurface(createFakeLayout(SCOPE, saved));
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
