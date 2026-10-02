import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCommentVNode, defineComponent, h, nextTick, ref, shallowRef } from "vue";
import { useSortableItem, useSortableList } from "@/ui-kit/composables";
import VcSortable from "./vc-sortable.vue";
import type { ISortableItemContextType, SortableMovePayloadType } from "@/ui-kit/composables";
import type { Ref, VNode } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- replays SortableJS's option and event objects
const instances: { el: HTMLElement; options: Record<string, any> }[] = [];
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
    constructor(el: HTMLElement, options: Record<string, unknown>) {
      instances.push({ el, options });
    }
  },
}));

enableAutoUnmount(afterEach);

beforeEach(() => {
  instances.length = 0;
});

// Records what `useSortableItem` hands a component rendered inside an item, and what one nested inside
// that component gets.
const seen: { outer?: ISortableItemContextType; inner?: ISortableItemContextType }[] = [];

const Inner = defineComponent({
  setup() {
    seen.at(-1)!.inner = useSortableItem();
    return () => h("span");
  },
});

const Outer = defineComponent({
  setup() {
    seen.push({ outer: useSortableItem() });
    return () => h("span", [h(Inner)]);
  },
});

function mountList(props: Record<string, unknown> = {}, withItemComponent = false) {
  const model = ref(["a", "b", "c"]);

  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            VcSortable<string>,
            {
              modelValue: model.value,
              "onUpdate:modelValue": (value: string[]) => {
                model.value = value;
              },
              name: "main",
              ...props,
            },
            {
              item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) =>
                h("div", { ...attrs, class: ["row", attrs.class] }, withItemComponent ? [item, h(Outer)] : item),
              after: () => h("p", { class: "hint" }, "empty"),
            },
          );
      },
    }),
    { attachTo: document.body },
  );

  return { wrapper, model, sortable: () => instances.at(-1)! };
}

describe("VcSortable", () => {
  // SortableJS moves the item element alone. A fragment's anchor text nodes would stay behind, and Vue
  // would then place and remove the item against anchors that no longer surround it.
  it("renders every item as a plain element, with no anchors of its own around it", () => {
    const { wrapper } = mountList();
    const rows = wrapper.findAll(".row").map((row) => row.element);

    expect(rows).toHaveLength(3);
    expect(rows[1].previousSibling).toBe(rows[0]);
    expect(rows[2].previousSibling).toBe(rows[1]);
  });

  it("ignores template comments around the item's root element", () => {
    const wrapper = mount(VcSortable<string>, {
      props: { modelValue: ["a", "b"], name: "main" },
      slots: {
        item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) => [
          createCommentVNode("the row"),
          h("div", { ...attrs, class: ["row", attrs.class] }, item),
        ],
      },
      attachTo: document.body,
    });
    const rows = wrapper.findAll(".row").map((row) => row.element);

    expect(rows[1].previousSibling).toBe(rows[0]);
  });

  it("puts the list's attributes on each item's own root element", () => {
    const { wrapper } = mountList();
    const row = wrapper.get(".row");

    expect(row.attributes("data-sortable-id")).toBe("a");
    expect(row.classes()).toEqual(expect.arrayContaining(["row", "vc-sortable__item", "vc-sortable__item--whole"]));
    expect(row.attributes("role")).toBe("button");
  });

  it("names the container, and keeps the `after` slot after the items", () => {
    const { wrapper } = mountList();

    expect(wrapper.get(".vc-sortable").attributes("data-sortable-name")).toBe("main");
    expect(wrapper.get(".vc-sortable").element.lastElementChild?.className).toBe("hint");
  });

  it("writes a pointer reorder back through v-model and puts the DOM back", async () => {
    const { wrapper, model, sortable } = mountList();
    const container = wrapper.get(".vc-sortable").element as HTMLElement;
    const item = wrapper.findAll(".row")[2].element as HTMLElement;

    sortable().options.onStart({ item });
    container.insertBefore(item, container.firstElementChild);
    sortable().options.onUpdate({
      from: container,
      to: container,
      item,
      oldIndex: 2,
      oldDraggableIndex: 2,
      newDraggableIndex: 0,
    });
    await nextTick();

    expect(model.value).toEqual(["c", "a", "b"]);
    expect(wrapper.findAll(".row").map((row) => row.text())).toEqual(["c", "a", "b"]);
    expect(container.lastElementChild?.className).toBe("hint");
  });

  it("maps a reorder of object items back to the same objects through `itemKey`", async () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const model = shallowRef(items);
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<{ id: string }>,
              {
                modelValue: model.value,
                "onUpdate:modelValue": (value: { id: string }[]) => {
                  model.value = value;
                },
                itemKey: (item: { id: string }) => item.id,
              },
              {
                item: ({ item, attrs }: { item: { id: string }; attrs: Record<string, unknown> }) =>
                  h("div", { ...attrs, class: ["row", attrs.class] }, item.id),
              },
            );
        },
      }),
      { attachTo: document.body },
    );
    const container = wrapper.get(".vc-sortable").element as HTMLElement;
    const item = wrapper.findAll(".row")[2].element as HTMLElement;

    expect(item.getAttribute("data-sortable-id")).toBe("c");

    const { options } = instances.at(-1)!;
    options.onStart({ item });
    container.insertBefore(item, container.firstElementChild);
    options.onUpdate({ from: container, to: container, item, oldIndex: 2, oldDraggableIndex: 2, newDraggableIndex: 0 });
    await nextTick();

    expect(model.value).toEqual([items[2], items[0], items[1]]);
    expect(model.value[0]).toBe(items[2]);
  });

  // The v-model owner may refuse a reorder (a save in flight); nothing re-renders then, so only the
  // restore keeps the DOM matching the model.
  it("keeps the DOM on the model's order when the owner refuses a reorder", async () => {
    const model = ref(["a", "b", "c"]);
    const wrapper = mount(VcSortable<string>, {
      // A listener that ignores the update: the prop stays, as a refusing owner's would.
      props: { modelValue: model.value, name: "main", "onUpdate:modelValue": () => undefined },
      slots: {
        item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) =>
          h("div", { ...attrs, class: ["row", attrs.class] }, item),
      },
      attachTo: document.body,
    });
    const container = wrapper.element as HTMLElement;
    const item = wrapper.findAll(".row")[0].element as HTMLElement;

    instances.at(-1)!.options.onStart({ item });
    container.append(item);
    instances.at(-1)!.options.onUpdate({
      from: container,
      to: container,
      item,
      oldIndex: 0,
      oldDraggableIndex: 0,
      newDraggableIndex: 2,
    });
    await nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["b", "c", "a"]]);
    expect(wrapper.findAll(".row").map((row) => row.text())).toEqual(["a", "b", "c"]);
  });

  // By index alone the last item would go back after the v-for's closing anchor, so the next item Vue
  // inserts would land in front of it.
  it("puts a refused move back inside the list, so later items still render after it", async () => {
    const model = ref(["a", "b", "c"]);
    const wrapper = mount(VcSortable<string>, {
      props: { modelValue: model.value, name: "main", "onUpdate:modelValue": () => undefined },
      slots: {
        item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) =>
          h("div", { ...attrs, class: ["row", attrs.class] }, item),
        after: () => h("p", { class: "hint" }),
      },
      attachTo: document.body,
    });
    const container = wrapper.element as HTMLElement;
    const item = wrapper.findAll(".row")[2].element as HTMLElement;

    instances.at(-1)!.options.onStart({ item });
    container.insertBefore(item, container.firstElementChild);
    instances.at(-1)!.options.onUpdate({
      from: container,
      to: container,
      item,
      oldIndex: 2,
      oldDraggableIndex: 2,
      newDraggableIndex: 0,
    });
    await wrapper.setProps({ modelValue: ["a", "b", "c", "d"] });

    expect(wrapper.findAll(".row").map((row) => row.text())).toEqual(["a", "b", "c", "d"]);
  });

  it("emits a move to another list for the owner of both to apply", async () => {
    const { wrapper, model, sortable } = mountList();
    const container = wrapper.get(".vc-sortable").element as HTMLElement;
    const other = document.createElement("div");
    other.dataset.sortableName = "parked";
    document.body.append(other);
    const item = wrapper.findAll(".row")[0].element as HTMLElement;

    other.append(item);
    sortable().options.onEnd({ from: container, to: other, item, oldIndex: 0, newDraggableIndex: 0 });
    await nextTick();

    const list = wrapper.findComponent({ name: "VcSortable" });
    expect(list.emitted("move")).toEqual([[{ id: "a", from: "main", to: "parked", index: 0 }]]);
    expect(model.value).toEqual(["a", "b", "c"]);
    other.remove();
  });

  it("announces keyboard signals", async () => {
    const { wrapper } = mountList();

    await wrapper.get(".row").trigger("keydown", { key: " " });

    expect(wrapper.findComponent({ name: "VcSortable" }).emitted("announce")).toEqual([
      [{ kind: "grabbed", id: "a", index: 0, total: 3, canChangeList: false }],
    ]);
  });

  it("lets go of a held item that leaves the list", async () => {
    const { wrapper, model } = mountList();
    const row = () => wrapper.find('[data-sortable-id="b"]');

    row().element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    await nextTick();
    expect(row().attributes("aria-pressed")).toBe("true");

    model.value = ["a", "c"];
    await nextTick();
    model.value = ["a", "c", "b"];
    await nextTick();

    expect(row().attributes("aria-pressed")).toBe("false");
  });

  it("keeps the grab across consecutive keyboard moves", async () => {
    const { wrapper, model } = mountList();
    const row = () => wrapper.find('[data-sortable-id="a"]').element;

    row().dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    row().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await nextTick();
    await nextTick();
    row().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await nextTick();

    expect(model.value).toEqual(["b", "c", "a"]);
  });

  // Chrome blurs a focused element it removes, mid-patch; a blur-cancel then would put the item back.
  it("lets go of a held item before the render that removes it", async () => {
    const items = ref(["a", "b", "c"]);
    const List = defineComponent({
      setup() {
        const el = ref<HTMLElement | null>(null);
        const list = useSortableList(el, {
          name: "raw",
          items: () => items.value,
          onReorder: (ids) => {
            items.value = ids;
          },
        });
        const blurOnRemoval = (vnode: VNode) => (vnode.el as HTMLElement).dispatchEvent(new FocusEvent("blur"));
        return () =>
          h(
            "div",
            { ref: el },
            items.value.map((id) =>
              h("div", { key: id, ...list.itemAttrs(id), onVnodeBeforeUnmount: blurOnRemoval }, id),
            ),
          );
      },
    });
    const wrapper = mount(List, { attachTo: document.body });

    wrapper.find('[data-sortable-id="b"]').element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    await nextTick();
    items.value = ["a", "c"];
    await nextTick();
    await nextTick();

    expect(items.value).toEqual(["a", "c"]);
  });

  it("leaves keys from a control inside the handle to that control", () => {
    const Grip = defineComponent({
      setup() {
        const item = useSortableItem();
        return () => h("div", { ...item?.handleAttrs.value, class: "grip" }, [h("button", { class: "inner" }, "x")]);
      },
    });
    const wrapper = mount(VcSortable<string>, {
      props: { modelValue: ["a"], handle: ".grip" },
      slots: { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs, [h(Grip)]) },
      attachTo: document.body,
    });
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });

    wrapper.get(".inner").element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(wrapper.get(".grip").attributes("aria-pressed")).toBe("false");
  });

  describe("a keyboard grab carried between lists", () => {
    // The owner of both lists applies every move, as a real consumer does.
    function mountPair(initial: Record<string, string[]> = { shown: ["a", "b", "c"], parked: ["x"] }) {
      const lists = ref<Record<string, string[]>>(initial);
      const ring = Object.keys(initial);
      const signals: unknown[] = [];
      const onAnnounce = (signal: unknown) => signals.push(signal);
      const onMove = ({ id, from, to, index }: SortableMovePayloadType) => {
        lists.value[from] = lists.value[from].filter((item) => item !== id);
        const target = [...lists.value[to]];
        target.splice(index ?? target.length, 0, id);
        lists.value[to] = target;
      };
      const setList = (name: string) => (value: string[]) => {
        lists.value[name] = value;
      };
      const renderItem = ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) =>
        h("div", { ...attrs, class: ["row", attrs.class] }, item);
      const renderList = (name: string) =>
        h(
          VcSortable<string>,
          {
            key: name,
            modelValue: lists.value[name],
            "onUpdate:modelValue": setList(name),
            name,
            group: "pair",
            ring,
            orientation: "horizontal",
            onMove,
            onAnnounce,
          },
          { item: renderItem },
        );
      const wrapper = mount(
        defineComponent({
          setup() {
            return () => ring.map(renderList);
          },
        }),
        { attachTo: document.body },
      );
      const key = async (id: string, name: string) => {
        wrapper.find(`[data-sortable-id="${id}"]`).element.dispatchEvent(new KeyboardEvent("keydown", { key: name }));
        await nextTick();
        await nextTick();
      };
      const pressed = (id: string) => wrapper.find(`[data-sortable-id="${id}"]`).attributes("aria-pressed");
      const element = (id: string) => wrapper.find(`[data-sortable-id="${id}"]`).element as HTMLElement;
      const sortableOf = (name: string) =>
        instances.find((entry) => entry.el.getAttribute("data-sortable-name") === name)!;
      return { lists, key, pressed, element, signals, sortableOf };
    }

    it("keeps the item held in the list it moved to, until it is dropped", async () => {
      const { lists, key, pressed } = mountPair();

      await key("b", " ");
      await key("b", "ArrowDown");
      expect(lists.value).toEqual({ shown: ["a", "c"], parked: ["x", "b"] });
      expect(pressed("b")).toBe("true");

      await key("b", "ArrowLeft");
      expect(lists.value.parked).toEqual(["b", "x"]);

      await key("b", "Enter");
      expect(pressed("b")).toBe("false");
    });

    it("puts the item back where it was grabbed on Escape, across lists", async () => {
      const { lists, key, pressed } = mountPair();

      await key("b", " ");
      await key("b", "ArrowDown");
      await key("b", "ArrowLeft");
      await key("b", "Escape");

      expect(lists.value).toEqual({ shown: ["a", "b", "c"], parked: ["x"] });
      expect(pressed("b")).toBe("false");
    });

    it("returns the item to where it was first grabbed, however many lists it went through", async () => {
      const { lists, key } = mountPair();

      await key("b", " ");
      await key("b", "ArrowDown");
      await key("b", "ArrowUp");
      await key("b", "Escape");

      expect(lists.value).toEqual({ shown: ["a", "b", "c"], parked: ["x"] });
    });

    it("lands focus on the item at home after Escape, and says the move was cancelled", async () => {
      const { key, signals } = mountPair();

      await key("b", " ");
      await key("b", "ArrowDown");
      await key("b", "Escape");
      await nextTick();

      expect(document.activeElement?.getAttribute("data-sortable-id")).toBe("b");
      expect(signals.at(-1)).toEqual({ kind: "cancelled", id: "b" });
    });

    it("returns the item home when focus leaves it, and leaves focus where it went", async () => {
      const { lists, key, element } = mountPair();
      const outside = document.body.appendChild(document.createElement("button"));

      try {
        await key("b", " ");
        await key("b", "ArrowDown");
        element("b").focus();
        outside.focus();
        await nextTick();
        await nextTick();

        expect(lists.value).toEqual({ shown: ["a", "b", "c"], parked: ["x"] });
        expect(document.activeElement).toBe(outside);
      } finally {
        outside.remove();
      }
    });

    it("does not pull focus back to the item when it returns home on a blur to the page", async () => {
      const { lists, key, element } = mountPair();

      await key("b", " ");
      await key("b", "ArrowDown");
      element("b").focus();
      element("b").blur();
      await nextTick();
      await nextTick();

      expect(lists.value).toEqual({ shown: ["a", "b", "c"], parked: ["x"] });
      expect(document.activeElement).toBe(document.body);
    });

    // SortableJS captures indices at the press; a carried grab blur-cancelling back into the pressed list
    // would move the wrong item.
    it("lets go of a carried grab when a pointer press starts in the list it was grabbed in", async () => {
      const { lists, key, element, sortableOf } = mountPair();

      await key("b", " ");
      await key("b", "ArrowDown");
      sortableOf("shown").options.onChoose();
      element("b").dispatchEvent(new FocusEvent("blur"));
      await nextTick();

      expect(lists.value.shown).toEqual(["a", "c"]);
    });

    it("still returns a carried grab home when the press is in a list it did not come from", async () => {
      const { lists, key, element, sortableOf } = mountPair({ shown: ["a", "b", "c"], parked: ["x"], archive: [] });

      await key("b", " ");
      await key("b", "ArrowDown");
      sortableOf("archive").options.onChoose();
      element("b").dispatchEvent(new FocusEvent("blur"));
      await nextTick();

      expect(lists.value).toEqual({ shown: ["a", "b", "c"], parked: ["x"], archive: [] });
    });

    it("still puts back a move inside one list when a press starts in another list", async () => {
      const { lists, key, element, sortableOf } = mountPair();

      await key("b", " ");
      await key("b", "ArrowRight");
      sortableOf("parked").options.onChoose();
      element("b").dispatchEvent(new FocusEvent("blur"));
      await nextTick();

      expect(lists.value.shown).toEqual(["a", "b", "c"]);
    });
  });

  it("offers each item's drag controls to a component inside it, once", () => {
    seen.length = 0;
    mountList({ handle: ".grip" }, true);

    expect(seen).toHaveLength(3);
    expect(seen.map((entry) => entry.outer?.id.value)).toEqual(["a", "b", "c"]);
    expect(seen[0].outer?.handleAttrs.value).toMatchObject({ class: "vc-sortable__handle" });
    // Consumed by the first component, so a nested one renders no second handle.
    expect(seen.every((entry) => entry.inner === undefined)).toBe(true);
  });

  it("leaves the offer to a nested component when the outer one only peeks", () => {
    const nested: (ISortableItemContextType | undefined)[] = [];
    const Nested = defineComponent({
      setup() {
        nested.push(useSortableItem());
        return () => h("span");
      },
    });
    const Peek = defineComponent({
      setup() {
        useSortableItem({ consume: false });
        return () => h("span", [h(Nested)]);
      },
    });

    mount(VcSortable<string>, {
      props: { modelValue: ["a"], handle: ".grip" },
      slots: { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs, [h(Peek)]) },
    });

    expect(nested.map((context) => context?.id.value)).toEqual(["a"]);
  });

  it("offers no handle in a list that drags by the whole item, or while disabled", async () => {
    seen.length = 0;
    const { wrapper } = mountList({}, true);

    expect(seen[0].outer?.handleAttrs.value).toBeNull();

    seen.length = 0;
    wrapper.unmount();
    mountList({ handle: ".grip", enabled: false }, true);

    expect(seen[0].outer?.handleAttrs.value).toBeNull();
  });

  it("reflects a keyboard grab in the item context", async () => {
    seen.length = 0;
    mountList({ handle: ".grip" }, true);
    const handle = seen[0].outer!.handleAttrs.value!;

    handle.onKeydown({ key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    await nextTick();

    expect(seen[0].outer?.grabbed.value).toBe(true);
  });

  // The item leaves one list and renders in the other only once the owner applies the move, so focus has
  // to follow on the render after it — onto the item itself, or onto its handle in a handle list.
  describe("focus after a keyboard move between lists", () => {
    const Grip = defineComponent({
      setup() {
        const context = useSortableItem();
        return () =>
          h("button", { ...(context?.handleAttrs.value ?? {}), class: ["grip", context?.handleAttrs.value?.class] });
      },
    });

    function mountPair(handle: boolean) {
      const lists: Record<string, Ref<string[]>> = { shown: ref(["a", "b"]), parked: ref(["x", "y"]) };
      const onMove = ({ id, from, to }: SortableMovePayloadType) => {
        lists[from].value = lists[from].value.filter((item) => item !== id);
        lists[to].value = [...lists[to].value, id];
      };
      const list = (name: "shown" | "parked") =>
        h(
          VcSortable<string>,
          {
            modelValue: lists[name].value,
            name,
            group: "pair",
            ring: ["shown", "parked"],
            orientation: handle ? "vertical" : "horizontal",
            handle: handle ? ".grip" : undefined,
            onMove,
          },
          {
            item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) =>
              h("div", { ...attrs, class: ["row", attrs.class] }, handle ? [h(Grip)] : item),
          },
        );
      mount(defineComponent({ setup: () => () => h("div", [list("shown"), list("parked")]) }), {
        attachTo: document.body,
      });

      const row = document.querySelector<HTMLElement>('[data-sortable-name="shown"] [data-sortable-id="a"]')!;
      return handle ? row.querySelector<HTMLElement>(".grip")! : row;
    }

    const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: name }));

    it("lands on the moved item in the list it went to", async () => {
      const control = mountPair(false);
      control.focus();
      key(control, " ");
      key(control, "ArrowDown");
      await nextTick();
      await nextTick();

      const active = document.activeElement as HTMLElement;
      expect(active.dataset.sortableId).toBe("a");
      expect(active.closest<HTMLElement>("[data-sortable-name]")?.dataset.sortableName).toBe("parked");
    });

    it("lands on the moved item's handle in a handle list", async () => {
      const control = mountPair(true);
      control.focus();
      key(control, " ");
      key(control, "ArrowRight");
      await nextTick();
      await nextTick();

      const active = document.activeElement as HTMLElement;
      expect(active.classList.contains("grip")).toBe(true);
      expect(active.closest<HTMLElement>("[data-sortable-id]")?.dataset.sortableId).toBe("a");
      expect(active.closest<HTMLElement>("[data-sortable-name]")?.dataset.sortableName).toBe("parked");
    });
  });
});
