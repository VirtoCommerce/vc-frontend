import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { focusBlockControl } from "../composables/useLayoutFocus";
import { useSalesRepLayout } from "../composables/useSalesRepLayout";
import LayoutRegion from "./layout-region.vue";
import LayoutStats from "./layout-stats.vue";
import type { SalesRepLayoutRegionIdType } from "../types/layout";

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

// Stand in for SortableJS: record the options each region registers so a drop can be replayed through
// the real handlers, and keep the library's own DOM helpers.
const zones: ZoneType[] = [];
vi.mock("@vueuse/integrations/useSortable", () => ({
  useSortable: (el: unknown, _list: unknown, options: Record<string, unknown>) => {
    zones.push({ options, elRef: el as ZoneType["elRef"] });
    return { option: vi.fn(), start: vi.fn(), stop: vi.fn() };
  },
  removeNode: (node: Node) => {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  },
  insertNodeAt: (parent: Element, el: Element, index: number) => parent.insertBefore(el, parent.children[index]),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- replays SortableJS's event objects
type ZoneType = { options: any; elRef: { value: HTMLElement | null } };

const SCOPE = "dashboard" as const;

beforeEach(() => {
  zones.length = 0;
  apolloMock.result.value = { salesRepLayout: null };
});

function setup() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the composable's full surface
  let api: any;

  const Harness = defineComponent({
    setup() {
      const layout = useSalesRepLayout(SCOPE);

      // As pages/dashboard.vue stitches a region's two halves back together.
      function reorderVisible(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
        layout.reorder(regionId, [
          ...ids.map((id) => ({ id, hidden: false })),
          ...layout.state.value[regionId].filter((entry) => entry.hidden),
        ]);
      }

      // As the pages do, so focus follows a parked block.
      function toggleHidden(id: string, hidden: boolean, index?: number): void {
        layout.setHidden(id, hidden, index);
        focusBlockControl(id);
      }

      api = layout;

      return () =>
        h(LayoutStats, {
          scope: SCOPE,
          visible: layout.visibleIn("statistics"),
          hidden: layout.hiddenIn("statistics"),
          editing: layout.editing.value,
          onReorder: (ids: string[]) => reorderVisible("statistics", ids),
          onSetHidden: toggleHidden,
        });
    },
  });

  const wrapper = mount(Harness, { attachTo: document.body, global: { stubs: { VcIcon: true } } });
  return { wrapper, api };
}

/** Replay a drop into another zone: SortableJS's DOM move, then the handler it fires. */
async function dropInto(from: ZoneType, to: ZoneType, id: string, at?: number) {
  const fromEl = from.elRef.value!;
  const toEl = to.elRef.value!;
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

/** Replay a reorder inside one zone, reporting both index flavours as SortableJS does. */
async function moveWithin(zone: ZoneType, id: string, delta: number) {
  const el = zone.elRef.value!;
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
  await nextTick();
}

const blockIds = (wrapper: ReturnType<typeof setup>["wrapper"]) =>
  wrapper.findAll("[data-block-id]").map((el) => el.attributes("data-block-id"));

describe("stat row drag and drop", () => {
  // LayoutBlock must stay single-root. With a root sibling it renders as a fragment, SortableJS moves
  // only the element, and Vue can no longer unmount it — leaving the card in both zones at once.
  it("parks, reorders and restores without leaving a duplicate node behind", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const [visible, hidden] = zones;

    await dropInto(visible, hidden, "active_projects");
    expect(blockIds(wrapper)).toEqual(["orders_on_hold", "orders_placed_mtd", "my_customers", "active_projects"]);

    await moveWithin(visible, "orders_on_hold", 1);
    await dropInto(hidden, visible, "active_projects");

    const ids = blockIds(wrapper);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort((a, b) => String(a).localeCompare(String(b)))).toEqual([
      "active_projects",
      "my_customers",
      "orders_on_hold",
      "orders_placed_mtd",
    ]);
  });

  it("keeps a keyboard move that Chrome's focus-loss blur would otherwise cancel", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const card = wrapper.find('[data-block-id="orders_placed_mtd"]');

    // Synchronous on purpose: the browser fires this blur while Vue's patch moves the node, before the
    // queued refocus. `trigger()` awaits nextTick and would miss that window.
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    card.element.dispatchEvent(new FocusEvent("blur"));
    await nextTick();

    expect(api.state.value.statistics.map((entry: { id: string }) => entry.id)).toEqual([
      "orders_on_hold",
      "orders_placed_mtd",
      "active_projects",
      "my_customers",
    ]);
  });

  it("moves focus with a stat card that is parked by keyboard", async () => {
    const { wrapper, api } = setup();
    api.startEdit();
    await nextTick();

    const card = wrapper.find('[data-block-id="active_projects"]');
    (card.element as HTMLElement).focus();

    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    card.element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await nextTick();
    await nextTick();

    expect(api.hiddenIn("statistics").map((entry: { id: string }) => entry.id)).toEqual(["active_projects"]);
    expect(document.activeElement?.getAttribute("data-block-id")).toBe("active_projects");
  });

  // The region is one array and `hidden` is a flag, so without the drop index the card lands wherever
  // its old position fell among the other hidden cards — visibly jumping away from where it was let go.
  it("drops a stat card at the position it was released, not its old slot", async () => {
    const { api } = setup();
    api.startEdit();
    await nextTick();

    const [visible, hidden] = zones;

    // active_projects sits at array index 1, my_customers at 3.
    await dropInto(visible, hidden, "active_projects");
    await dropInto(visible, hidden, "my_customers", 0);

    expect(api.hiddenIn("statistics").map((entry: { id: string }) => entry.id)).toEqual([
      "my_customers",
      "active_projects",
    ]);
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

        function onReorder(ids: string[]): void {
          const hidden = layout.state.value.mainRight.filter((entry) => entry.hidden);
          layout.reorder("mainRight", [...ids.map((id) => ({ id, hidden: false })), ...hidden]);
        }

        function onSetHidden(id: string, hidden: boolean, index?: number): void {
          layout.setHidden(id, hidden, index);
        }

        const slots = { default: () => h("div", "widget") };

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

    const wrapper = mount(Harness, { attachTo: document.body, global: { stubs: { VcIcon: true } } });
    return { wrapper, api };
  }

  it("reorders a column and leaves no duplicate node behind", async () => {
    const { wrapper, api } = setupColumn();
    api.startEdit();
    await nextTick();

    expect(api.visibleIn("mainRight").map((entry: { id: string }) => entry.id)).toEqual(["actions", "info"]);

    await moveWithin(zones[0], "actions", 1);

    expect(api.visibleIn("mainRight").map((entry: { id: string }) => entry.id)).toEqual(["info", "actions"]);
    const ids = blockIds(wrapper);
    expect(ids).toEqual(["info", "actions"]);
  });

  it("hides a widget with the chrome button and keeps it out of the rendered set", async () => {
    const { wrapper, api } = setupColumn();
    api.startEdit();
    await nextTick();

    await wrapper.find('[data-block-id="actions"] .layout-block__hide').trigger("click");

    expect(api.hiddenIn("mainRight").map((entry: { id: string }) => entry.id)).toEqual(["actions"]);
    expect(blockIds(wrapper)).toEqual(["info"]);
  });
});
