import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import VcSortable from "./vc-sortable.vue";

// The real SortableJS, unlike the sibling suite: what is under test is how its revert plugin and this
// list's own node restore meet.
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

enableAutoUnmount(afterEach);

// jsdom has no layout, so no `elementFromPoint`; SortableJS asks it where a drop landed.
afterEach(() => {
  Reflect.deleteProperty(document, "elementFromPoint");
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// A native drag released over `outside`, which belongs to no list.
async function spill(item: HTMLElement, outside: Element) {
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => outside });
  const point = { bubbles: true, cancelable: true, button: 0, clientX: 1, clientY: 1 };
  item.dispatchEvent(new MouseEvent("pointerdown", point));
  item.dispatchEvent(new MouseEvent("mousedown", point));
  item.dispatchEvent(new Event("dragstart", { bubbles: true, cancelable: true }));
  await wait(30);
  item.dispatchEvent(new MouseEvent("dragend", { bubbles: true, cancelable: true, clientX: 500, clientY: 500 }));
  await nextTick();
}

function mountList(footer: boolean) {
  const rows = ref(["a", "b", "c"]);
  const reorders: string[][] = [];
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            VcSortable<string>,
            {
              modelValue: rows.value,
              "onUpdate:modelValue": (ids: string[]) => {
                reorders.push(ids);
                rows.value = ids;
              },
              name: "main",
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
  const order = () =>
    [...wrapper.element.children].map((node) => (node as HTMLElement).dataset.sortableId ?? "footer").join(",");
  return { wrapper, rows, reorders, order };
}

describe("VcSortable — a pointer drop outside every list", () => {
  it.each([
    ["the last item", "c", false],
    ["the last item, before a footer", "c", true],
    ["a middle item", "b", false],
  ])("puts %s back between the same neighbours, reordering nothing", async (_case, id, footer) => {
    const { wrapper, rows, reorders, order } = mountList(footer);
    const before = order();

    await spill(wrapper.get(`[data-sortable-id="${id}"]`).element as HTMLElement, document.body);
    expect([order(), reorders]).toEqual([before, []]);

    // A node left past the v-for's anchors shows on the next render.
    rows.value = [...rows.value, "d"];
    await nextTick();
    expect(order()).toBe(footer ? "a,b,c,d,footer" : "a,b,c,d");
  });
});
