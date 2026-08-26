import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { focusBlockControl } from "../composables/useLayoutFocus";
import { useSalesRepLayout } from "../composables/useSalesRepLayout";
import { DASHBOARD_LAYOUT_SCOPE, WIDGET_DRAG_FILTER_SELECTOR, WIDGET_DRAG_HANDLE_SELECTOR } from "../constants";
import { documentsBlock } from "../layout/documents-block";
import { getBlockRegistry, registerBlock } from "../layout/registry";
import LayoutHiddenTray from "./layout-hidden-tray.vue";
import LayoutRegion from "./layout-region.vue";
import LayoutStats from "./layout-stats.vue";
import LayoutWidget from "./layout-widget.vue";
import type { Mock } from "vitest";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";

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

// Stand in for SortableJS: record the element and options each region constructs with, so a gesture can
// be replayed through the real handlers. The component does its own DOM moves, so nothing else is needed.
const zones: ZoneType[] = [];
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
    constructor(el: HTMLElement, options: Record<string, unknown>) {
      zones.push({ el, options, option: this.option });
    }
  },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- replays SortableJS's event objects
type ZoneType = { el: HTMLElement; options: any; option: Mock };

const SCOPE = "dashboard" as const;

// As init() does for a rep carrying documents:read (VCST-5730) — the documents widget joins the
// dashboard registry through the runtime seam, not the defaults, so hiding it exercises a
// dynamically registered block.
registerBlock(DASHBOARD_LAYOUT_SCOPE, documentsBlock);

// One card per registered statistics block, keyed as useSalesRepDashboardWidgets keys them — the row
// renders nothing for an id with no matching card, which would empty every drag assertion below.
const CARDS = getBlockRegistry(SCOPE)
  .filter((block) => block.region === "statistics")
  .map((block) => ({ key: block.id, labelKey: block.titleKey, icon: "cash", value: "1" }));

// Every harness mounts with `attachTo: document.body`, and jsdom is reset per file rather than per
// test — so without this each test leaves its DOM behind for the next one. `focusBlockControl` looks
// its target up with a document-wide `querySelector`, which would then find an earlier test's card and
// let a focus assertion pass while the wrapper under test was never touched.
enableAutoUnmount(afterEach);

beforeEach(() => {
  zones.length = 0;
  apolloMock.result.value = { salesRepLayout: null };
});

function setup() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the composable's full surface
  let api: any;
  // Spied as well as applied: a same-list drag must emit no park at all, which surviving state alone
  // cannot show — `setHidden` would no-op on a block already in the half it names.
  const setHidden = vi.fn();

  const Harness = defineComponent({
    setup() {
      const layout = useSalesRepLayout(SCOPE);

      // As the pages do, so focus follows a parked block.
      function toggleHidden(id: string, hidden: boolean, index?: number): void {
        setHidden(id, hidden, index);
        layout.setHidden(id, hidden, index);
        focusBlockControl(id);
      }

      api = layout;

      return () =>
        h(LayoutStats, {
          scope: SCOPE,
          visible: layout.visibleIn("statistics"),
          hidden: layout.hiddenIn("statistics"),
          cards: CARDS,
          editing: layout.editing.value,
          onReorder: (ids: string[]) => layout.reorderVisible("statistics", ids),
          onSetHidden: toggleHidden,
        });
    },
  });

  // Stubbed only to keep the log readable: both are reached through a `v-if` these harnesses never take,
  // but the compiler hoists their resolution above that branch.
  const wrapper = mount(Harness, {
    attachTo: document.body,
    global: { stubs: { VcIcon: true, VcShape: true, VcLoaderOverlay: true } },
  });
  return { wrapper, api, setHidden };
}

/** Replay a drop into another zone: SortableJS's DOM move, then the handler it fires. */
async function dropInto(from: ZoneType, to: ZoneType, id: string, at?: number) {
  const fromEl = from.el;
  const toEl = to.el;
  const item = fromEl.querySelector(`[data-block-id="${id}"]`) as HTMLElement;
  const oldIndex = [...fromEl.children].indexOf(item);
  const blocks = [...toEl.querySelectorAll(".layout-block")];
  const target = at === undefined ? null : (blocks[at] ?? null);
  toEl.insertBefore(item, target);
  from.options.onEnd({
    from: fromEl,
    to: toEl,
    item,
    oldIndex,
    newIndex: [...toEl.children].indexOf(item),
    newDraggableIndex: at ?? blocks.length,
  });
  await nextTick();
}

/**
 * Replay a reorder inside one zone, reporting both index flavours as SortableJS does — and firing
 * `end` after `update`, which the real library always does for the same drop
 * (sortable.esm.js:2002 then :2023). Without it nothing exercises `onEnd`'s same-list guard.
 */
async function moveWithin(zone: ZoneType, id: string, delta: number) {
  const el = zone.el;
  const item = el.querySelector(`[data-block-id="${id}"]`) as HTMLElement;
  const kids = [...el.children];
  const blocks = [...el.querySelectorAll(".layout-block")];
  const oldIndex = kids.indexOf(item);
  const oldDraggableIndex = blocks.indexOf(item);
  el.insertBefore(item, kids[oldIndex + delta + (delta > 0 ? 1 : 0)] ?? null);
  const moved = [...el.children];
  zone.options.onUpdate({
    from: el,
    to: el,
    item,
    oldIndex,
    newIndex: moved.indexOf(item),
    oldDraggableIndex,
    newDraggableIndex: [...el.querySelectorAll(".layout-block")].indexOf(item),
  });
  zone.options.onEnd({ from: el, to: el, item, oldIndex, newIndex: [...el.children].indexOf(item) });
  await nextTick();
}

const blockIds = (wrapper: ReturnType<typeof setup>["wrapper"]) =>
  wrapper.findAll("[data-block-id]").map((el) => el.attributes("data-block-id"));

const STAT_IDS = CARDS.map((card) => card.key);

/** The list with `from` re-inserted at `to` — the expected result of one move, at any list length. */
function movedTo(ids: readonly string[], from: number, to: number): string[] {
  const rest = [...ids];
  const [item] = rest.splice(from, 1);
  rest.splice(to, 0, item);
  return rest;
}

const alphabetically = (a: unknown, b: unknown) => String(a).localeCompare(String(b));

describe("stat row drag and drop", () => {
  // LayoutBlock must stay single-root. With a root sibling it renders as a fragment, SortableJS moves
  // only the element, and Vue can no longer unmount it — leaving the card in both zones at once.
  it("parks, reorders and restores without leaving a duplicate node behind", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const [visible, hidden] = zones;

    // Visible half first, then the parked one — the two zones render in that order.
    await dropInto(visible, hidden, "active_carts");
    expect(blockIds(wrapper)).toEqual([...STAT_IDS.filter((id) => id !== "active_carts"), "active_carts"]);

    await moveWithin(visible, "new_orders", 1);
    await dropInto(hidden, visible, "active_carts");

    const ids = blockIds(wrapper);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort(alphabetically)).toEqual([...STAT_IDS].sort(alphabetically));
  });

  it("keeps a keyboard move that Chrome's focus-loss blur would otherwise cancel", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const card = wrapper.find('[data-block-id="orders_placed_week"]');

    // Synchronous on purpose: the browser fires this blur while Vue's patch moves the node, before the
    // queued refocus. `trigger()` awaits nextTick and would miss that window.
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    card.element.dispatchEvent(new FocusEvent("blur"));
    await nextTick();

    // ArrowLeft moved index 2 to index 1; nothing else shifted.
    expect(api.state.value.regions.statistics.visible).toEqual(movedTo(STAT_IDS, 2, 1));
  });

  it("moves focus with a stat card that is parked by keyboard", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const card = wrapper.find('[data-block-id="active_carts"]');
    (card.element as HTMLElement).focus();

    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await nextTick();
    await nextTick();

    expect(api.hiddenIn("statistics")).toEqual(["active_carts"]);
    expect(document.activeElement?.getAttribute("data-block-id")).toBe("active_carts");
    // Identity is not enough — the id alone would match a leaked card from another test.
    expect(wrapper.element.contains(document.activeElement)).toBe(true);
  });

  // `layout-block--grabbed` is not gated on edit mode, so a grab left behind keeps the card at 45%
  // opacity with a drop shadow on the ordinary dashboard, and Space would drop rather than grab it.
  it("drops a held card's grab when edit mode ends", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const card = wrapper.find('[data-block-id="orders_placed_week"]');
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    await nextTick();
    expect(card.element.className).toContain("layout-block--grabbed");

    api.cancel();
    await nextTick();

    expect(wrapper.find('[data-block-id="orders_placed_week"]').element.className).not.toContain(
      "layout-block--grabbed",
    );

    api.startEdit();
    await nextTick();
    expect(wrapper.find('[data-block-id="orders_placed_week"]').element.className).not.toContain(
      "layout-block--grabbed",
    );
  });

  // Backward is the direction that catches `restore()` reading the child index before removing the
  // node: with the node still in place, the index it reads is one short and the card lands too early.
  it("reorders a card backwards", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const before = [...api.visibleIn("statistics")];
    await moveWithin(zones[0], before[2], -1);

    const after = movedTo(before, 2, 1);
    expect(api.visibleIn("statistics")).toEqual(after);
    expect(blockIds(wrapper)).toEqual(after);
  });

  // SortableJS fires `end` after `update` for one same-list drop, so `onEnd` sees a gesture that
  // `onUpdate` has already applied. Its `from === to` guard is what stops it acting twice.
  it("does not park a card when a drag ends in the list it started in", async () => {
    const { api, setHidden } = setup();
    api.startEdit();
    await nextTick();

    await moveWithin(zones[0], api.visibleIn("statistics")[0], 1);

    expect(setHidden).not.toHaveBeenCalled();
    expect(api.hiddenIn("statistics")).toEqual([]);
  });

  // Rendered even while cards are present, so CSS can hide it on `:has(.layout-block)` instead. Gated
  // on `entries`, the hint only appeared on drop — dragging the last card out left the zone blank.
  it("keeps the empty-zone hint mounted so it can track the drag rather than the drop", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const hints = wrapper.findAll(".layout-region__empty");

    // Both stat zones, even though the visible one is full and the hidden one is empty.
    expect(hints).toHaveLength(2);
  });

  // The hint is a container child, so `restore()` reading `event.from.children` must still line up.
  it("reorders correctly with the hint present as a trailing child", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const before = [...api.visibleIn("statistics")];
    await moveWithin(zones[0], before.at(-1), -1);

    const expected = [...before.slice(0, -2), before.at(-1), before.at(-2)];
    expect(api.visibleIn("statistics")).toEqual(expected);
    expect(blockIds(wrapper)).toEqual(expected);
  });

  // The mock swallows every Sortable option, so nothing else in the suite would notice if the wiring
  // that makes dragging possible at all were dropped.
  it("wires the Sortable options the drag behaviour depends on", async () => {
    const { api } = setup();
    const [visible] = zones;

    expect(visible.options.draggable).toBe(".layout-block");
    expect(visible.options.group).toBe("sales-rep-stats-dashboard");
    // Whole-card drag for stats, so no handle selector narrows it.
    expect(visible.options.handle).toBeUndefined();
    // Disabled until edit mode, and enabled by the watch rather than a rebuild.
    expect(visible.options.disabled).toBe(true);
    // Without a touch hold, a swipe starting on a card drags instead of scrolling the page.
    expect(visible.options.delay).toBe(200);
    expect(visible.options.delayOnTouchOnly).toBe(true);

    api.startEdit();
    await nextTick();
    expect(visible.option).toHaveBeenCalledWith("disabled", false);

    api.cancel();
    await nextTick();
    expect(visible.option).toHaveBeenCalledWith("disabled", true);
  });

  // A pointer drag and a keyboard grab reordering the same array at once drops the wrong block.
  it("releases a keyboard grab when a pointer drag is chosen", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const card = wrapper.find('[data-block-id="orders_placed_week"]');
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    await nextTick();
    expect(card.element.className).toContain("layout-block--grabbed");

    const order = api.visibleIn("statistics");
    zones[0].options.onChoose({ item: card.element });
    await nextTick();

    expect(wrapper.find('[data-block-id="orders_placed_week"]').element.className).not.toContain(
      "layout-block--grabbed",
    );
    // Released, not cancelled — a cancel would reshuffle the list mid-drag.
    expect(api.visibleIn("statistics")).toEqual(order);
  });

  it("ignores the park key for a card already in the zone that key leads to", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const before = api.visibleIn("statistics");
    const card = wrapper.find(`[data-block-id="${before[0]}"]`);

    // ArrowUp is "restore", and this card is already visible.
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    await nextTick();

    expect(api.visibleIn("statistics")).toEqual(before);
    expect(api.hiddenIn("statistics")).toEqual([]);
  });

  // The region is one array and `hidden` is a flag, so without the drop index the card lands wherever
  // its old position fell among the other hidden cards — visibly jumping away from where it was let go.
  it("drops a stat card at the position it was released, not its old slot", async () => {
    const { api } = setup();
    api.startEdit();
    await nextTick();

    const [visible, hidden] = zones;

    // active_carts sits at array index 1, my_customers at 3.
    await dropInto(visible, hidden, "active_carts");
    await dropInto(visible, hidden, "my_customers", 0);

    expect(api.hiddenIn("statistics")).toEqual(["my_customers", "active_carts"]);
  });
});

// The stat row is horizontal and drags whole cards; a widget column is vertical and drags by a handle,
// so it exercises a different branch of the same component.
describe("widget column drag and drop", () => {
  function setupColumn() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the composable's full surface
    let api: any;

    const Harness = defineComponent({
      setup() {
        const layout = useSalesRepLayout("customerProfile");

        api = layout;

        const onReorder = (ids: string[]) => layout.reorderVisible("mainRight", ids);
        const onSetHidden = (id: string, hidden: boolean, index?: number) => layout.setHidden(id, hidden, index);

        // A real LayoutWidget, not a bare div: the hide button lives in the widget's own header now, so
        // a stand-in would leave the button this suite clicks unrendered.
        const slots = { default: () => h(LayoutWidget, { title: "widget" }, { default: () => "body" }) };

        return () =>
          h(
            LayoutRegion,
            {
              scope: "customerProfile",
              entries: layout.visibleIn("mainRight"),
              orientation: "vertical",
              group: "sales-rep-customer-main-right",
              editing: layout.editing.value,
              onReorder,
              onSetHidden,
            },
            slots,
          );
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
      // VcWidget and VcButton — the widget's controls — are registered globally by the ui-kit plugin,
      // which no test boots.
      global: {
        components: { VcButton, VcWidget },
        stubs: { VcIcon: true, VcShape: true, VcLoaderOverlay: true },
      },
    });
    return { wrapper, api };
  }

  it("reorders a column and leaves no duplicate node behind", async () => {
    const { wrapper, api } = setupColumn();
    api.startEdit();
    await nextTick();

    expect(api.visibleIn("mainRight")).toEqual([
      "actions",
      "info",
      "search_history",
      "browse_history",
      "customer_activity",
    ]);

    await moveWithin(zones[0], "actions", 1);

    expect(api.visibleIn("mainRight")).toEqual([
      "info",
      "actions",
      "search_history",
      "browse_history",
      "customer_activity",
    ]);
    const ids = blockIds(wrapper);
    expect(ids).toEqual(["info", "actions", "search_history", "browse_history", "customer_activity"]);
  });

  it("hides a widget with its ✕ and keeps it out of the rendered set", async () => {
    const { wrapper, api } = setupColumn();
    api.startEdit();
    await nextTick();

    await wrapper.find('[data-block-id="actions"] .layout-widget__hide').trigger("click");

    expect(api.hiddenIn("mainRight")).toEqual(["actions"]);
    expect(blockIds(wrapper)).toEqual(["info", "search_history", "browse_history", "customer_activity"]);
  });

  // ✕ now lives inside the drag surface, so `filter` is the only thing stopping a mousedown on it from
  // starting a drag. Sortable is stubbed here, so this pins the wiring — the gesture is a manual check.
  it("gives Sortable a header handle, and excludes the hide button from it", () => {
    setupColumn();

    expect(zones[0].options).toMatchObject({
      handle: WIDGET_DRAG_HANDLE_SELECTOR,
      filter: WIDGET_DRAG_FILTER_SELECTOR,
      preventOnFilter: false,
    });
  });

  // Stat cards drag whole and carry no ✕, so neither option applies.
  it("leaves the stat row dragging whole, with no handle or filter", () => {
    setup();

    expect(zones[0].options.handle).toBeUndefined();
    expect(zones[0].options.filter).toBeUndefined();
  });
});

// The dashboard's right rail holds the built-in My activity widget (VCST-5337) plus the dynamically
// registered documents widget (VCST-5730), so this is the regression net for a block that joins a
// surface through `registerBlock` rather than the registry defaults: its ✕ must move it to the hidden
// half, the tray must offer it back, and the restore must re-render it — the same contract the
// built-in widgets get from the suites above.
describe("dashboard rail with the runtime-registered documents widget", () => {
  function setupRail() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the composable's full surface
    let api: any;

    const Harness = defineComponent({
      setup() {
        const layout = useSalesRepLayout(SCOPE);

        api = layout;

        // As useLayoutPage's toggleHidden does — both the region's ✕ and the tray's restore land here.
        function toggleHidden(id: string, hidden: boolean, index?: number): void {
          layout.setHidden(id, hidden, index);
          focusBlockControl(id);
        }

        const slots = { default: () => h(LayoutWidget, { title: "widget" }, { default: () => "body" }) };

        return () =>
          h("div", [
            h(
              LayoutRegion,
              {
                scope: SCOPE,
                entries: layout.visibleIn("mainRight"),
                orientation: "vertical",
                group: `sales-rep-${SCOPE}-main-right`,
                editing: layout.editing.value,
                onReorder: (ids: string[]) => layout.reorderVisible("mainRight", ids),
                onSetHidden: toggleHidden,
              },
              slots,
            ),
            // The tray, gated as layout-surface.vue gates it, so the restore path is the real button.
            ...(layout.editing.value && layout.hiddenIn("mainRight").length
              ? [
                  h(LayoutHiddenTray, {
                    scope: SCOPE,
                    entries: layout.hiddenIn("mainRight"),
                    onRestore: (id: string) => toggleHidden(id, false),
                  }),
                ]
              : []),
          ]);
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: {
        components: { VcButton, VcWidget },
        stubs: { VcIcon: true, VcShape: true, VcLoaderOverlay: true },
      },
    });
    return { wrapper, api };
  }

  it("hides the documents widget into the tray with its ✕", async () => {
    const { wrapper, api } = setupRail();
    api.startEdit();
    await nextTick();

    expect(api.visibleIn("mainRight")).toEqual(["my_activity", "documents"]);

    await wrapper.find('[data-block-id="documents"] .layout-widget__hide').trigger("click");

    expect(api.hiddenIn("mainRight")).toEqual(["documents"]);
    expect(api.visibleIn("mainRight")).toEqual(["my_activity"]);
    expect(wrapper.find('[data-block-id="documents"]').exists()).toBe(false);
    expect(wrapper.find('[data-restore-id="documents"]').exists()).toBe(true);
  });

  it("restores it from the tray", async () => {
    const { wrapper, api } = setupRail();
    api.startEdit();
    await nextTick();

    await wrapper.find('[data-block-id="documents"] .layout-widget__hide').trigger("click");
    await wrapper.find('[data-restore-id="documents"]').trigger("click");

    expect(api.visibleIn("mainRight")).toEqual(["my_activity", "documents"]);
    expect(api.hiddenIn("mainRight")).toEqual([]);
    expect(wrapper.find('[data-block-id="documents"]').exists()).toBe(true);
    expect(wrapper.find('[data-restore-id="documents"]').exists()).toBe(false);
  });

  // SAVE LAYOUT sends the draft as one full-document replace, so a hide only survives if the hidden
  // documents block is in the payload — a block missing from it is simply gone after the save.
  it("sends the hidden documents block in the save payload", async () => {
    const { wrapper, api } = setupRail();
    api.startEdit();
    await nextTick();

    await wrapper.find('[data-block-id="documents"] .layout-widget__hide').trigger("click");
    apolloMock.mutate.mockReset();
    void api.save();

    const command = apolloMock.mutate.mock.calls[0][0].command as {
      regions: { id: string; blocks: { id: string; type: string; hidden: boolean }[] }[];
    };
    const mainRight = command.regions.find((region) => region.id === "mainRight");
    expect(mainRight?.blocks).toContainEqual(
      expect.objectContaining({ id: "documents", type: "documents", hidden: true }),
    );
  });
});

// The one case where SortableJS's DOM edit and the state it should produce disagree: the emit is
// refused, so no re-render follows to correct the DOM. `restore()` is what keeps them in step —
// without it the card stays where it was dropped and only snaps back on the next unrelated render.
describe("a drop the draft refuses", () => {
  it("puts the DOM back after a refused reorder", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const before = [...api.visibleIn("statistics")];

    // A save in flight — `editable()` is false, so `reorderVisible` is a no-op.
    apolloMock.loading.value = true;
    await moveWithin(zones[0], before[0], 1);
    apolloMock.loading.value = false;

    expect(api.visibleIn("statistics")).toEqual(before);
    expect(blockIds(wrapper)).toEqual(before);
  });

  it("puts the DOM back after a refused cross-zone drop", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const before = [...api.visibleIn("statistics")];
    const [visible, hidden] = zones;

    apolloMock.loading.value = true;
    await dropInto(visible, hidden, "active_carts");
    apolloMock.loading.value = false;

    expect(api.hiddenIn("statistics")).toEqual([]);
    expect(blockIds(wrapper)).toEqual(before);
  });
});
