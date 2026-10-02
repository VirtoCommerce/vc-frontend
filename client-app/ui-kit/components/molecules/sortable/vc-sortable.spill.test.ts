import { enableAutoUnmount, mount } from "@vue/test-utils";
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

// A native drag released over the page, outside every list. `during` stands in for SortableJS moving
// the node under the pointer before the release — the placeholder the user saw.
async function spill(item: HTMLElement, during: () => void) {
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => document.body });
  const point = { bubbles: true, cancelable: true, button: 0, clientX: 1, clientY: 1 };
  item.dispatchEvent(new MouseEvent("pointerdown", point));
  item.dispatchEvent(new MouseEvent("mousedown", point));
  item.dispatchEvent(new Event("dragstart", { bubbles: true, cancelable: true }));
  await wait(30);
  during();
  item.dispatchEvent(new MouseEvent("dragend", { bubbles: true, cancelable: true, clientX: 500, clientY: 500 }));
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
  return { el, rows, item, order };
}

describe("VcSortable — a pointer drop outside every list", () => {
  it.each([
    ["dragged to the top", false],
    ["dragged to the top, before a footer", true],
  ])("puts the last item back between its neighbours when %s, reordering nothing", async (_case, footer) => {
    const log: unknown[] = [];
    const list = mountList("main", ["a", "b", "c"], footer, log);
    const before = list.order();

    await spill(list.item("c"), () => list.el.insertBefore(list.item("c"), list.item("a")));
    expect([list.order(), log]).toEqual([before, []]);

    // A node left past the v-for's anchors shows on the next render.
    list.rows.value = [...list.rows.value, "d"];
    await nextTick();
    expect(list.order()).toBe(footer ? "a,b,c,d,footer" : "a,b,c,d");
  });

  it("puts the item back in its own list when dragged into a sibling first, moving nothing", async () => {
    const log: unknown[] = [];
    const source = mountList("source", ["a", "b", "c"], false, log);
    const target = mountList("target", ["x", "y"], false, log);

    await spill(source.item("c"), () => target.el.insertBefore(source.item("c"), target.item("x")));

    expect([source.order(), target.order(), log]).toEqual(["a,b,c", "x,y", []]);
  });
});
