import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createLayoutController } from "../composables/useLayout";
import { createFakeLayout, registerTestDashboard, TEST_STAT_CARDS } from "../layout-test-utils";
import { getBlockRegistry, registerBlock } from "../registry";
import LayoutEditBar from "./_internal/layout-edit-bar.vue";
import LayoutEditButton from "./_internal/layout-edit-button.vue";
import LayoutEmptyState from "./_internal/layout-empty-state.vue";
import LayoutRegion from "./_internal/layout-region.vue";
import LayoutStats from "./_internal/layout-stats.vue";
import LayoutSurface from "./layout-surface.vue";
import type { LayoutControllerOptionsType, LayoutControllerType, LayoutInputType, SavedLayoutType } from "../types";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcEmptyView from "@/ui-kit/components/molecules/empty-view/vc-empty-view.vue";
import VcStatWidget from "@/ui-kit/components/organisms/stat-widget/vc-stat-widget.vue";
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
let probeSetups = 0;

const Probe = defineComponent({
  inheritAttrs: false,

  setup(_props, { attrs }) {
    seen = { ...attrs };
    probeSetups++;
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
  probeSetups = 0;
});

function mountSurface(layout: LayoutControllerType, props: Record<string, unknown> = {}) {
  return mount(LayoutSurface, {
    props: { layout, cards: TEST_STAT_CARDS, ...props },
    attachTo: document.body,
    // The ui-kit plugin registers these globally and no test boots it. VcButton must be the real one —
    // the edit toggle is a VcButton, and a stub would not carry its click. VcEmptyView too: the empty
    // state's buttons live in its slots, which a stub does not render.
    global: {
      components: { VcButton, VcEmptyView, VcStatWidget, VcWidget, VcWidgetSkeleton },
      stubs: {
        VcIcon: true,
        VcShape: true,
        VcAlert: true,
        VcLoaderOverlay: true,
        VcInput: true,
        VcTypography: true,
        // vue-i18n is mocked down to `useI18n`, so its global component is never registered.
        "i18n-t": true,
      },
    },
  });
}

/** The real controller over a spec-owned store, for what the fake's always-agreeing storage cannot do. */
function controllerOver(
  load: LayoutControllerOptionsType["load"],
  save: LayoutControllerOptionsType["save"],
): LayoutControllerType {
  return createLayoutController({ scope: SCOPE, load, save, defaults: () => getBlockRegistry(SCOPE) });
}

/**
 * The real controller whose first read answers `first` and whose every save gets an echo that disagrees, so the
 * stored document is read again; that read waits for `landReread`.
 */
function controllerWithHeldReread(first: SavedLayoutType | null) {
  let reads = 0;
  let land: (saved: SavedLayoutType | null) => void = () => {};
  const layout = controllerOver(
    () =>
      reads++ === 0
        ? Promise.resolve(first)
        : new Promise<SavedLayoutType | null>((resolve) => {
            land = resolve;
          }),
    () => Promise.resolve({ regions: [] }),
  );

  return { layout, landReread: (saved: SavedLayoutType | null) => land(saved) };
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
// skeleton and the real stat card, loading, rather than re-drawing them — the only way its height cannot drift.
describe("LayoutSurface while the layout is read for the first time", () => {
  // A read that never lands, so the surface stays at its first render.
  function mountLoading() {
    return mountSurface(createFakeLayout(SCOPE, { read: "pending" }));
  }

  it("draws each block with the kit's skeleton and a loading stat card, and no blocks of its own", () => {
    const wrapper = mountLoading();
    const registered = getBlockRegistry(SCOPE);
    const widgets = registered.filter((block) => block.region !== "statistics" && !block.defaultHidden);
    const stats = registered.filter((block) => block.region === "statistics" && !block.defaultHidden);

    expect(wrapper.findAll(".layout-skeleton .vc-widget-skeleton")).toHaveLength(widgets.length);
    expect(wrapper.findAll(".layout-skeleton .vc-stat-widget")).toHaveLength(stats.length);
    // Nothing sortable renders until the saved arrangement is known.
    expect(wrapper.find("[data-block-id]").exists()).toBe(false);
  });
});

describe("LayoutSurface stat row", () => {
  it("renders each visible card as the kit's VcStatWidget in the card's color", async () => {
    const wrapper = mountSurface(createFakeLayout(SCOPE));
    await flushPromises();

    const beta = wrapper.get('[data-block-id="beta"] .vc-stat-widget');
    expect(beta.classes()).toContain("vc-stat-widget--color--success");
  });

  it("marks only the cards whose query failed, with the engine's own message", async () => {
    const cards = TEST_STAT_CARDS.map((card) => (card.key === "gamma" ? { ...card, failed: true } : card));
    const wrapper = mountSurface(createFakeLayout(SCOPE), { cards });
    await flushPromises();

    expect(wrapper.get('[data-block-id="gamma"] .vc-stat-widget__error').text()).toBe(
      "shared.dashboard.stats.load_failed",
    );
    expect(wrapper.find('[data-block-id="alpha"] .vc-stat-widget__error').exists()).toBe(false);
  });
});

describe("LayoutSurface after a failed read", () => {
  it("says the default arrangement is shown, and offers no edit button", async () => {
    const wrapper = mountSurface(createFakeLayout(SCOPE, { read: "failed" }), { editButtonPlacement: "end" });
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

  // A toggle states its state once: a changing label on top of `aria-pressed` reads it out twice.
  it("keeps its label in edit mode and reports the mode through aria-pressed", async () => {
    const wrapper = mountSurface(createFakeLayout(SCOPE));
    await flushPromises();
    const toggle = () => wrapper.get("[data-layout-edit-toggle]");
    expect(toggle().attributes("aria-pressed")).toBe("false");

    await toggle().trigger("click");
    await flushPromises();

    expect(toggle().text()).toBe("shared.dashboard.edit");
    expect(toggle().attributes("aria-pressed")).toBe("true");
  });
});

describe("LayoutSurface while saving", () => {
  // Nothing may change mid-save, keyboard included — the overlay alone would leave the controls focusable.
  it("makes the layout inert", async () => {
    const layout = createFakeLayout(SCOPE);
    const wrapper = mountSurface(layout);
    await flushPromises();
    layout.startEdit();
    await flushPromises();
    expect(wrapper.get(".layout-surface__layout").attributes("inert")).toBeUndefined();

    const release = layout.holdNextSave();
    const saving = layout.save();
    await flushPromises();

    expect(wrapper.get(".layout-surface__layout").attributes("inert")).toBeDefined();

    release();
    await saving;
  });
});

// A save whose echo disagrees with what was sent ends with the stored document read again (useLayout.ts).
describe("LayoutSurface while the stored document is read again", () => {
  async function saveIntoARereadThatWaits() {
    const { layout, landReread } = controllerWithHeldReread(null);
    const wrapper = mountSurface(layout);
    await flushPromises();
    layout.startEdit();
    await flushPromises();
    await layout.save();
    await flushPromises();

    return { wrapper, landReread };
  }

  // A save meanwhile would replace a document nobody has seen.
  it("disables Save until the read lands", async () => {
    const { wrapper, landReread } = await saveIntoARereadThatWaits();
    expect(wrapper.get("[data-layout-save]").attributes("disabled")).toBeDefined();

    landReread(null);
    await flushPromises();

    expect(wrapper.get("[data-layout-save]").attributes("disabled")).toBeUndefined();
  });

  // The failure could not focus a disabled Save, so focus would otherwise stay on <body>.
  it("hands focus to Save once the read lands", async () => {
    const { wrapper, landReread } = await saveIntoARereadThatWaits();
    expect(document.activeElement).toBe(document.body);

    landReread(null);
    await flushPromises();

    expect(document.activeElement).toBe(wrapper.get("[data-layout-save]").element);
  });
});

// Two surfaces of one dashboard on a page.
describe("LayoutSurface beside another surface", () => {
  // They must not trade blocks: the widget columns take no drop from any other list, and each stat row pairs its two
  // zones under a group of its own.
  it("lets no block move between surfaces", async () => {
    const first = mountSurface(createFakeLayout(SCOPE));
    const second = mountSurface(createFakeLayout(SCOPE));
    await flushPromises();
    const groupsIn = (wrapper: ReturnType<typeof mountSurface>, orientation: "horizontal" | "vertical") =>
      wrapper
        .findAllComponents(LayoutRegion)
        .filter((region) => region.props("orientation") === orientation)
        .map((region) => region.props("group"));
    const columns = groupsIn(first, "vertical");
    const statRow = groupsIn(first, "horizontal");

    expect(columns.length).toBeGreaterThan(0);
    expect(columns.every((group) => group === undefined)).toBe(true);
    expect(statRow.length).toBeGreaterThan(0);
    expect(groupsIn(second, "horizontal").filter((group) => statRow.includes(group))).toEqual([]);
  });

  // Both in edit mode, so a lookup across the whole page would find the first surface's Save first.
  it("hands focus to its own Save when its save fails", async () => {
    const first = createFakeLayout(SCOPE);
    const second = createFakeLayout(SCOPE);
    mountSurface(first);
    const wrapper = mountSurface(second);
    await flushPromises();
    first.startEdit();
    second.startEdit();
    await flushPromises();
    second.failNextSave.value = true;

    await second.save();
    await flushPromises();

    expect(document.activeElement).toBe(wrapper.get("[data-layout-save]").element);
  });
});

// Hiding the last rail widget unmounts the whole column, which is intended — an empty `aside` would
// otherwise hold its desktop width open — but it must not lose the blocks or the way back.
describe("LayoutSurface with an emptied rail", () => {
  // Seeded from a saved document rather than by clicking each ✕: a hidden block never renders.
  async function mountWithHiddenRail() {
    const railBlocks = ["side", "extra", PROBE_ID].map((type) => ({ type, hidden: true }));
    const saved: SavedLayoutType = { regions: [{ blocks: railBlocks }] };

    const wrapper = mountSurface(createFakeLayout(SCOPE, { saved }));
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

// A hidden block never mounts, in view or edit mode (the tray lists it by title), so none of its queries can run.
// Plugins rely on it: the Sales Rep Hub's documents widget must send no request while hidden (VCST-5730 §4.5).
describe("LayoutSurface with one widget hidden", () => {
  it("never mounts it, in view or edit mode, so it sends no request", async () => {
    const saved: SavedLayoutType = { regions: [{ blocks: [{ type: PROBE_ID, hidden: true }] }] };
    const wrapper = mountSurface(createFakeLayout(SCOPE, { saved }));
    await flushPromises();

    // The rail still renders its other widgets.
    expect(wrapper.find(".layout-surface__aside").exists()).toBe(true);
    expect(probeSetups).toBe(0);

    await wrapper.find("[data-layout-edit-toggle]").trigger("click");
    await flushPromises();

    expect(wrapper.find(`[data-restore-id="${PROBE_ID}"]`).exists()).toBe(true);
    expect(probeSetups).toBe(0);
  });
});

// With every block hidden there is nothing to show and nothing to edit from: an empty state stands in for the
// regions and the edit button, and offers the two ways back.
describe("LayoutSurface with every block hidden", () => {
  /** Every registered block hidden — the document the empty state stands in for. */
  const allHidden = (): SavedLayoutType => ({
    regions: [{ blocks: getBlockRegistry(SCOPE).map((block) => ({ type: block.id, hidden: true })) }],
  });

  async function mountAllHidden(
    layout: LayoutControllerType = createFakeLayout(SCOPE, { saved: allHidden() }),
    props: Record<string, unknown> = {},
  ) {
    const wrapper = mountSurface(layout, props);
    await flushPromises();

    return wrapper;
  }

  const restoreButton = (wrapper: Awaited<ReturnType<typeof mountAllHidden>>) =>
    wrapper.findAllComponents(VcButton).find((button) => button.attributes("data-layout-restore") !== undefined);

  it.each(["mainColumn", "end"])(
    "shows the empty state instead of the regions and the edit button (%s)",
    async (placement) => {
      const wrapper = await mountAllHidden(undefined, { editButtonPlacement: placement });

      expect(wrapper.findComponent(LayoutEmptyState).exists()).toBe(true);
      expect(wrapper.findComponent(LayoutStats).exists()).toBe(false);
      expect(wrapper.findAllComponents(LayoutRegion)).toHaveLength(0);
      expect(wrapper.findComponent(LayoutEditButton).exists()).toBe(false);
    },
  );

  // A restore whose echo disagrees reads the stored document again, and nothing may be written until that read
  // lands — Cancel brings the empty state back meanwhile.
  it("disables both actions while the layout cannot be edited", async () => {
    const { layout, landReread } = controllerWithHeldReread(allHidden());
    const wrapper = await mountAllHidden(layout);

    await wrapper.get("[data-layout-restore]").trigger("click");
    await flushPromises();
    const cancel = wrapper
      .findAll(".layout-edit-bar button")
      .find((button) => button.text() === "shared.dashboard.cancel");
    await cancel!.trigger("click");
    await flushPromises();

    expect(wrapper.findComponent(LayoutEmptyState).exists()).toBe(true);
    expect(wrapper.get("[data-layout-restore]").attributes("disabled")).toBeDefined();
    expect(wrapper.get("[data-layout-empty-edit]").attributes("disabled")).toBeDefined();
    expect(restoreButton(wrapper)?.props("loading")).toBe(false);

    landReread(allHidden());
    await flushPromises();

    expect(wrapper.get("[data-layout-restore]").attributes("disabled")).toBeUndefined();
    expect(wrapper.get("[data-layout-empty-edit]").attributes("disabled")).toBeUndefined();
  });

  it("shows Restore loading and locks Edit layout while the write is in flight", async () => {
    const layout = createFakeLayout(SCOPE, { saved: allHidden() });
    const wrapper = await mountAllHidden(layout);
    const release = layout.holdNextSave();

    await wrapper.get("[data-layout-restore]").trigger("click");
    await flushPromises();

    expect(restoreButton(wrapper)?.props("loading")).toBe(true);
    expect(wrapper.get("[data-layout-empty-edit]").attributes("disabled")).toBeDefined();

    release();
    await flushPromises();
  });

  // In edit mode the empty zones and the tray are the way back, and the empty state would cover them.
  it("opens edit mode from its own Edit layout button, with every block offered back", async () => {
    const wrapper = await mountAllHidden();

    await wrapper.get("[data-layout-empty-edit]").trigger("click");
    await flushPromises();

    expect(wrapper.findComponent(LayoutEmptyState).exists()).toBe(false);
    expect(wrapper.findComponent(LayoutEditBar).exists()).toBe(true);
    expect(wrapper.find(`[data-restore-id="${PROBE_ID}"]`).exists()).toBe(true);
  });

  it("comes back when edit mode is cancelled without restoring anything", async () => {
    const wrapper = await mountAllHidden();

    await wrapper.get("[data-layout-empty-edit]").trigger("click");
    await flushPromises();
    await wrapper.get("[data-layout-edit-toggle]").trigger("click");
    await flushPromises();

    expect(wrapper.findComponent(LayoutEmptyState).exists()).toBe(true);
  });

  it("writes the defaults on Restore and renders the blocks again, without edit mode", async () => {
    // Stores and echoes exactly what was sent: a disagreeing echo is a refused save.
    const save = vi.fn((command: LayoutInputType) => Promise.resolve({ regions: command.regions }));
    const wrapper = await mountAllHidden(controllerOver(() => Promise.resolve(allHidden()), save));

    await wrapper.get("[data-layout-restore]").trigger("click");
    await flushPromises();

    expect(save).toHaveBeenCalledTimes(1);
    expect(wrapper.findComponent(LayoutEmptyState).exists()).toBe(false);
    expect(wrapper.findComponent(LayoutEditBar).exists()).toBe(false);
    expect(wrapper.findComponent(Probe).exists()).toBe(true);
  });
});
