import { enableAutoUnmount, mount } from "@vue/test-utils";
import Sortable from "sortablejs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import VcSortable from "./vc-sortable.vue";
import type { SortableMovePayloadType } from "@/ui-kit/composables";

// The real SortableJS, unlike the sibling suite: what is under test is how its revert plugin and this
// list's own node restore meet.
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

enableAutoUnmount(afterEach);

// jsdom has no layout, so no `elementFromPoint`; SortableJS asks it where a drop landed.
afterEach(() => {
  Reflect.deleteProperty(document, "elementFromPoint");
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ModeType = "native" | "fallback";

// A drag released over `at`. `during` stands in for SortableJS moving the node under the pointer before
// the release — the placeholder the user saw. The mouse uses native drag and drop; touch the fallback.
async function drag(mode: ModeType, list: HTMLElement, item: HTMLElement, at: Element, during: () => void) {
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => at });
  if (mode === "native") {
    const point = { bubbles: true, cancelable: true, button: 0, clientX: 1, clientY: 1 };
    item.dispatchEvent(new MouseEvent("pointerdown", point));
    item.dispatchEvent(new MouseEvent("mousedown", point));
    item.dispatchEvent(new Event("dragstart", { bubbles: true, cancelable: true }));
    await wait(30);
    during();
    item.dispatchEvent(new MouseEvent("dragend", { bubbles: true, cancelable: true, clientX: 500, clientY: 500 }));
  } else {
    (Sortable.get(list) as unknown as { nativeDraggable: boolean }).nativeDraggable = false;
    const point = (x: number) => ({ bubbles: true, cancelable: true, button: 0, clientX: x, clientY: x });
    item.dispatchEvent(new MouseEvent("pointerdown", point(1)));
    document.dispatchEvent(new MouseEvent("pointermove", point(40)));
    await wait(30);
    document.dispatchEvent(new MouseEvent("pointermove", point(80)));
    await wait(30);
    during();
    document.dispatchEvent(new MouseEvent("pointerup", point(500)));
  }
  await nextTick();
}

function mountList(name: string, initial: string[], footer: boolean, log: unknown[]) {
  const rows = ref(initial);
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            VcSortable<string>,
            {
              modelValue: rows.value,
              "onUpdate:modelValue": (ids: string[]) => {
                log.push(["reorder", name, ids]);
                rows.value = ids;
              },
              onMove: (payload: SortableMovePayloadType) => log.push(["move", payload]),
              name,
              group: "spill",
            },
            {
              item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) => h("div", attrs, item),
              after: () => (footer ? h("p", { "data-part": "footer" }) : null),
            },
          );
      },
    }),
    { attachTo: document.body },
  );
  const el = wrapper.element as HTMLElement;
  const item = (id: string) => el.querySelector<HTMLElement>(`[data-sortable-id="${id}"]`)!;
  const order = () => [...el.children].map((node) => (node as HTMLElement).dataset.sortableId ?? "footer").join(",");
  // A node left past the v-for's anchors only shows on the next render, so every check renders one more.
  const appended = async (id: string) => {
    rows.value = [...rows.value, id];
    await nextTick();
    return order();
  };
  return { el, item, order, appended };
}

const CASES = (["native", "fallback"] as const).flatMap((mode) => [
  [mode, false],
  [mode, true],
]) as [ModeType, boolean][];

describe("VcSortable — a pointer drop outside every list", () => {
  it.each(CASES)(
    "%s, footer %s: puts the last item back between its neighbours, reordering nothing",
    async (mode, footer) => {
      const log: unknown[] = [];
      const list = mountList("main", ["a", "b", "c"], footer, log);
      const before = list.order();

      await drag(mode, list.el, list.item("c"), document.body, () =>
        list.el.insertBefore(list.item("c"), list.item("a")),
      );

      expect([list.order(), log]).toEqual([before, []]);
      expect(await list.appended("d")).toBe(footer ? "a,b,c,d,footer" : "a,b,c,d");
    },
  );

  it.each(CASES)(
    "%s, footer %s: puts the item back in its own list after a sibling, moving nothing",
    async (mode, footer) => {
      const log: unknown[] = [];
      const source = mountList("source", ["a", "b", "c"], footer, log);
      const target = mountList("target", ["x", "y"], footer, log);

      await drag(mode, source.el, source.item("c"), document.body, () =>
        target.el.insertBefore(source.item("c"), target.item("x")),
      );

      expect([target.order(), log]).toEqual([footer ? "x,y,footer" : "x,y", []]);
      expect(await source.appended("d")).toBe(footer ? "a,b,c,d,footer" : "a,b,c,d");
    },
  );

  it.each(["native", "fallback"] as const)(
    "%s: puts the item back by index when its old neighbour left the list during the drag",
    async (mode) => {
      const log: unknown[] = [];
      const list = mountList("main", ["a", "b", "c"], false, log);
      const neighbour = list.item("b");

      await drag(mode, list.el, list.item("a"), document.body, () => neighbour.remove());

      expect([list.order(), log]).toEqual(["a,c", []]);
      list.el.insertBefore(neighbour, list.item("c"));
    },
  );

  // The spill is the drop's own business: the next drag inside the list reorders as any other.
  it.each(["native", "fallback"] as const)("%s: reorders on the next drag after a spill", async (mode) => {
    const log: unknown[] = [];
    const list = mountList("main", ["a", "b", "c"], false, log);
    const toTop = () => list.el.insertBefore(list.item("c"), list.item("a"));

    await drag(mode, list.el, list.item("c"), document.body, toTop);
    await drag(mode, list.el, list.item("c"), list.el, toTop);

    expect(log).toEqual([["reorder", "main", ["c", "a", "b"]]]);
  });
});
