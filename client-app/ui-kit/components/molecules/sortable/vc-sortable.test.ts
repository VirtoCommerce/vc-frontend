import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCommentVNode, defineComponent, h, nextTick, ref, shallowRef } from "vue";
import { useSortableItem, useSortableList } from "@/ui-kit/composables";
import VcSortable from "./vc-sortable.vue";
import type { ISortableItemContext, SortableMovePayloadType } from "@/ui-kit/composables";
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

// The list's own announcements are localized; the key and its parameters are what a test can see.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string, params?: object) => (params ? `${key} ${JSON.stringify(params)}` : key) }),
}));

enableAutoUnmount(afterEach);

beforeEach(() => {
  instances.length = 0;
});

const seen: { outer?: ISortableItemContext; inner?: ISortableItemContext }[] = [];

const Inner = defineComponent({
  setup() {
    seen.at(-1)!.inner = useSortableItem();
    return () => h("span");
  },
});

// Binds the handle as a real consumer would, so a handle list mounts without a missing-handle warning.
const Outer = defineComponent({
  setup() {
    const item = useSortableItem();
    seen.push({ outer: item });
    return () => h("span", { ...item?.handleAttrs }, [h(Inner)]);
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

  it("keeps the DOM on the model's order when the owner refuses a reorder", async () => {
    const model = ref(["a", "b", "c"]);
    const wrapper = mount(VcSortable<string>, {
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

  it("hands keyboard signals to an `announce` listener", async () => {
    const { wrapper } = mountList({ onAnnounce: vi.fn() });

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
        return () =>
          h("div", { ...item?.handleAttrs, class: ["grip", item?.handleAttrs?.class] }, [
            h("button", { class: "inner" }, "x"),
          ]);
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
    function mountPair(initial: Record<string, string[]> = { shown: ["a", "b", "c"], parked: ["x"] }) {
      const lists = ref<Record<string, string[]>>(initial);
      const order = Object.keys(initial);
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
            listOrder: order,
            orientation: "horizontal",
            onMove,
            onAnnounce,
          },
          { item: renderItem },
        );
      const wrapper = mount(
        defineComponent({
          setup() {
            return () => order.map(renderList);
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

    it("lets go of a carried grab when a pointer press starts in the list it was grabbed in", async () => {
      const { lists, key, element, sortableOf } = mountPair();

      await key("b", " ");
      await key("b", "ArrowDown");
      sortableOf("shown").options.onChoose();
      element("b").dispatchEvent(new FocusEvent("blur"));
      await nextTick();

      expect(lists.value.shown).toEqual(["a", "c"]);
    });

    it("lets go of a carried grab in place when the press is in the list that holds it", async () => {
      const { lists, key, element, pressed, sortableOf } = mountPair({
        shown: ["a", "b", "c"],
        parked: ["x"],
        archive: [],
      });

      await key("b", " ");
      await key("b", "ArrowDown");
      sortableOf("parked").options.onChoose();
      element("b").dispatchEvent(new FocusEvent("blur"));
      await nextTick();

      expect(lists.value).toEqual({ shown: ["a", "c"], parked: ["x", "b"], archive: [] });
      expect(pressed("b")).toBe("false");
    });

    it("still returns a carried grab home when the press is in a third list of the group", async () => {
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
    expect(seen.map((entry) => entry.outer?.id)).toEqual(["a", "b", "c"]);
    expect(seen[0].outer?.handleAttrs).toMatchObject({ class: "vc-sortable__handle" });
    expect(seen.every((entry) => entry.inner === undefined)).toBe(true);
  });

  it("leaves the offer to a nested component when the outer one only peeks", () => {
    const nested: (ISortableItemContext | undefined)[] = [];
    const Nested = defineComponent({
      setup() {
        const item = useSortableItem();
        nested.push(item);
        return () => h("span", { ...item?.handleAttrs });
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

    expect(nested.map((context) => context?.id)).toEqual(["a"]);
  });

  it("offers no handle in a list that drags by the whole item, or while disabled", async () => {
    seen.length = 0;
    const { wrapper } = mountList({}, true);

    expect(seen[0].outer?.handleAttrs).toBeNull();

    seen.length = 0;
    wrapper.unmount();
    mountList({ handle: ".grip", disabled: true }, true);

    expect(seen[0].outer?.handleAttrs).toBeNull();
  });

  it("reflects a keyboard grab in the item context", async () => {
    seen.length = 0;
    mountList({ handle: ".grip" }, true);
    const handle = seen[0].outer!.handleAttrs!;

    handle.onKeydown({ key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    await nextTick();

    expect(seen[0].outer?.grabbed).toBe(true);
  });

  describe("focus after a keyboard move between lists", () => {
    const Grip = defineComponent({
      setup() {
        const context = useSortableItem();
        return () => h("button", { ...(context?.handleAttrs ?? {}), class: ["grip", context?.handleAttrs?.class] });
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
            listOrder: ["shown", "parked"],
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

describe("VcSortable — what a consumer gets without wiring it", () => {
  const liveRegion = () => document.body.querySelector<HTMLElement>('[aria-live="polite"]');

  it("announces a keyboard grab in its own live region", async () => {
    const { wrapper } = mountList();

    await wrapper.get(".row").trigger("keydown", { key: " " });
    await nextTick();

    expect(liveRegion()?.textContent).toBe('ui_kit.sortable.grabbed {"position":1,"total":3}');
  });

  // Every signal kind, with what it is told: a swapped key or an off-by-one place is otherwise invisible.
  async function spoken(keys: string[], props: Record<string, unknown> = {}) {
    const { wrapper } = mountList(props);
    const row = () => wrapper.find('[data-sortable-id="b"]').element;
    for (const key of keys) {
      row().dispatchEvent(new KeyboardEvent("keydown", { key }));
      await nextTick();
      await nextTick();
    }
    return liveRegion()?.textContent;
  }

  it.each([
    ["grabbed", [" "], {}, 'ui_kit.sortable.grabbed {"position":2,"total":3}'],
    [
      "grabbed_lists",
      [" "],
      { listOrder: ["main", "other"] },
      'ui_kit.sortable.grabbed_lists {"position":2,"total":3}',
    ],
    ["moved", [" ", "ArrowDown"], {}, 'ui_kit.sortable.moved {"position":3,"total":3}'],
    ["dropped", [" ", "ArrowDown", " "], {}, 'ui_kit.sortable.dropped {"position":3,"total":3}'],
    ["edge", [" ", "ArrowDown", "ArrowDown"], {}, "ui_kit.sortable.edge"],
    ["cancelled", [" ", "Escape"], {}, "ui_kit.sortable.cancelled"],
    [
      "no_target",
      [" ", "ArrowRight"],
      { group: "alone", listOrder: ["main", "other"], onMove: vi.fn() },
      "ui_kit.sortable.no_target",
    ],
  ])("words %s for the live region", async (_kind, keys, props, text) => {
    expect(await spoken(keys, props)).toBe(text);
  });

  it("names the list an item moved to by its place in `listOrder`, not by its id", async () => {
    const lists = ref<Record<string, string[]>>({ shown: ["a"], parked: [] });
    const order = ["shown", "parked", "archive"];
    const onMove = ({ id, from, to }: SortableMovePayloadType) => {
      lists.value[from] = lists.value[from].filter((item) => item !== id);
      lists.value[to] = [...lists.value[to], id];
    };
    mount(
      defineComponent({
        setup() {
          return () =>
            ["shown", "parked"].map((name) =>
              h(
                VcSortable<string>,
                { key: name, modelValue: lists.value[name], name, group: "spoken", listOrder: order, onMove },
                { item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) => h("div", attrs, item) },
              ),
            );
        },
      }),
      { attachTo: document.body },
    );
    const item = document.querySelector<HTMLElement>('[data-sortable-id="a"]')!;

    item.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    item.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await nextTick();
    await nextTick();

    const spokenTexts = [...document.querySelectorAll('[aria-live="polite"]')].map((region) => region.textContent);
    expect(spokenTexts).toContain('ui_kit.sortable.moved_list {"position":2,"total":3}');
  });

  it("asks the current `accepts` on the keyboard and the pointer path", async () => {
    const lists = ref<Record<string, string[]>>({ shown: ["a"], parked: [] });
    const order = ["shown", "parked"];
    const rule = ref<() => boolean>(() => false);
    const onMove = ({ id, from, to }: SortableMovePayloadType) => {
      lists.value[from] = lists.value[from].filter((item) => item !== id);
      lists.value[to] = [...lists.value[to], id];
    };
    mount(
      defineComponent({
        setup() {
          return () =>
            order.map((name) =>
              h(
                VcSortable<string>,
                {
                  key: name,
                  modelValue: lists.value[name],
                  name,
                  group: "rules",
                  listOrder: order,
                  accepts: name === "parked" ? rule.value : undefined,
                  onMove,
                },
                { item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) => h("div", attrs, item) },
              ),
            );
        },
      }),
      { attachTo: document.body },
    );
    const parked = instances.find((instance) => instance.el.getAttribute("data-sortable-name") === "parked")!;
    const shownEl = document.querySelector('[data-sortable-name="shown"]');
    const item = () => document.querySelector<HTMLElement>('[data-sortable-id="a"]')!;
    const put = () => parked.options.group.put({}, { el: shownEl }, item());

    expect(put()).toBe(false);

    rule.value = () => true;
    await nextTick();

    expect(put()).toEqual(["rules"]);
    item().dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    item().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(lists.value).toEqual({ shown: [], parked: ["a"] });
  });

  it("says the item was dropped when the move to another list ends the grab", async () => {
    const lists = ref<Record<string, string[]>>({ shown: ["a"], parked: [] });
    const order = ["shown", "parked"];
    const onMove = ({ id, from, to }: SortableMovePayloadType) => {
      lists.value[from] = lists.value[from].filter((item) => item !== id);
      lists.value[to] = [...lists.value[to], id];
    };
    mount(
      defineComponent({
        setup() {
          return () =>
            order.map((name) =>
              h(
                VcSortable<string>,
                {
                  key: name,
                  modelValue: lists.value[name],
                  name,
                  group: "dropped",
                  listOrder: order,
                  dropOnListChange: true,
                  onMove,
                },
                { item: ({ item, attrs }: { item: string; attrs: Record<string, unknown> }) => h("div", attrs, item) },
              ),
            );
        },
      }),
      { attachTo: document.body },
    );
    const item = () => document.querySelector<HTMLElement>('[data-sortable-id="a"]')!;

    item().dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    item().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await nextTick();
    await nextTick();

    const spokenTexts = [...document.querySelectorAll('[aria-live="polite"]')].map((region) => region.textContent);
    expect(spokenTexts).toContain('ui_kit.sortable.moved_list_dropped {"position":2,"total":2}');
    expect(item().getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps its own region beside an `announce` listener, which hears every signal", async () => {
    const onAnnounce = vi.fn();
    const { wrapper } = mountList({ onAnnounce });

    await wrapper.get(".row").trigger("keydown", { key: " " });
    await nextTick();

    expect(onAnnounce).toHaveBeenCalledWith(expect.objectContaining({ kind: "grabbed" }));
    expect(liveRegion()?.textContent).toBe('ui_kit.sortable.grabbed {"position":1,"total":3}');
  });

  it("announces a repeated message again", async () => {
    const { wrapper } = mountList();
    const press = (key: string) => wrapper.get(".row").element.dispatchEvent(new KeyboardEvent("keydown", { key }));
    const texts: string[] = [];
    press(" ");
    press("ArrowUp");
    await nextTick();
    await nextTick();
    texts.push(liveRegion()!.textContent);

    press("ArrowUp");
    await nextTick();
    texts.push(liveRegion()!.textContent);
    await nextTick();
    texts.push(liveRegion()!.textContent);

    expect(texts).toEqual(["ui_kit.sortable.edge", "", "ui_kit.sortable.edge"]);
  });

  it("renders no region with `liveRegion` off, leaving the wording to an `announce` listener", async () => {
    const onAnnounce = vi.fn();
    const { wrapper } = mountList({ liveRegion: false, onAnnounce });

    await wrapper.get(".row").trigger("keydown", { key: " " });
    await nextTick();

    expect(liveRegion()).toBeNull();
    expect(onAnnounce).toHaveBeenCalledWith(expect.objectContaining({ kind: "grabbed" }));
  });

  it("keeps the live region out of the container, which may be a table body", () => {
    const { wrapper } = mountList({ tag: "tbody" });

    expect(wrapper.get(".vc-sortable").element.querySelector("[aria-live]")).toBeNull();
    expect(liveRegion()).not.toBeNull();
  });

  it("reorders objects without an `itemKey`, keeping every one of them", () => {
    const items = [{ name: "a" }, { name: "b" }, { name: "c" }];
    const model = ref(items);
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<{ name: string }>,
              {
                modelValue: model.value,
                "onUpdate:modelValue": (value: { name: string }[]) => {
                  model.value = value;
                },
              },
              {
                item: ({ item, attrs }: { item: { name: string }; attrs: Record<string, unknown> }) =>
                  h("div", { ...attrs, class: ["row", attrs.class] }, item.name),
              },
            );
        },
      }),
      { attachTo: document.body },
    );
    const ids = wrapper.findAll(".row").map((row) => row.attributes("data-sortable-id"));

    instances.at(-1)!.options.onUpdate({
      item: wrapper.findAll(".row")[0].element,
      from: wrapper.get(".vc-sortable").element,
      oldIndex: 0,
      oldDraggableIndex: 0,
      newDraggableIndex: 2,
    });

    expect(new Set(ids).size).toBe(3);
    expect(model.value).toEqual([items[1], items[2], items[0]]);
  });

  it("emits `grab` and `release` around a keyboard grab", async () => {
    const onGrab = vi.fn();
    const onRelease = vi.fn();
    const { wrapper } = mountList({ onGrab, onRelease });
    const row = wrapper.get(".row");

    await row.trigger("keydown", { key: " " });
    await row.trigger("keydown", { key: " " });

    expect(onGrab).toHaveBeenCalledWith({ id: "a", from: "main" });
    expect(onRelease).toHaveBeenCalledWith({ id: "a" });
  });

  it("drags by the handle element with a bare `handle`", () => {
    mountList({ handle: true }, true);

    expect(instances.at(-1)!.options.handle).toBe(".vc-sortable__handle");
  });
});

describe("VcSortable — development warnings", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  const warnings = () => warn.mock.calls.map(([text]: unknown[]) => String(text));

  function mountWith(props: Record<string, unknown>, item: (attrs: Record<string, unknown>, id: string) => unknown) {
    return mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<string>,
              { modelValue: ["a", "b"], ...props },
              { item: ({ item: id, attrs }: { item: string; attrs: Record<string, unknown> }) => item(attrs, id) },
            );
        },
      }),
      { attachTo: document.body },
    );
  }

  it("stays silent for a list bound as documented", () => {
    mountList();
    mountList({ handle: ".grip", group: "quiet", onMove: vi.fn() }, true);

    expect(warnings()).toEqual([]);
  });

  it("warns when the live region is off and nothing listens to `announce`", () => {
    mountList({ liveRegion: false });
    mountList({ liveRegion: false, onAnnounce: vi.fn() });

    expect(warnings()).toEqual([expect.stringContaining("`liveRegion` is off and nothing listens to `announce`")]);
  });

  it("counts `.once` listeners as listening", () => {
    mountList({ liveRegion: false, onAnnounceOnce: vi.fn() });
    mountList({ name: "once", group: "once", onMoveOnce: vi.fn() });

    expect(warnings()).toEqual([]);
  });

  it("warns when an item does not get its attrs", () => {
    mountWith({}, (_attrs, id) => h("div", id));

    expect(warnings()).toContainEqual(expect.stringContaining('item "a" did not get its `attrs`'));
  });

  it("warns when the item slot renders more than one root", () => {
    mountWith({}, (attrs, id) => [h("div", attrs, id), h("span", "extra")]);

    expect(warnings()).toContainEqual(expect.stringContaining('item "a" renders 2 root nodes'));
  });

  it("warns when a handle list's item binds no handle", () => {
    mountWith({ handle: true }, (attrs, id) => h("div", attrs, id));

    expect(warnings()).toContainEqual(expect.stringContaining('item "a" has no handle'));
  });

  it("warns when a list in a group has no name, or no move listener", () => {
    mountWith({ group: "loud" }, (attrs, id) => h("div", attrs, id));

    expect(warnings()).toEqual(
      expect.arrayContaining([
        expect.stringContaining('group "loud" has no `name`'),
        expect.stringContaining('group "loud" has no `@move` listener'),
      ]),
    );
  });

  it("warns when `listOrder` is set without a `group`", () => {
    mountWith({ name: "a", listOrder: ["a", "b"] }, (attrs, id) => h("div", attrs, id));

    expect(warnings()).toEqual([expect.stringContaining("`listOrder` needs a `group`")]);
  });

  it("warns when `listOrder` leaves out the list's own name", () => {
    mountWith({ name: "shown", group: "order", listOrder: ["shown", "parked"], onMove: vi.fn() }, (attrs, id) =>
      h("div", attrs, id),
    );
    mountWith({ name: "parked", group: "order", listOrder: ["shown", "parkd"], onMove: vi.fn() }, (attrs, id) =>
      h("div", attrs, id),
    );

    expect(warnings()).toEqual([expect.stringContaining('does not include this list\'s name "parked"')]);
  });

  it("warns once about `listOrder` though an inline array is new on every render", async () => {
    const tick = ref(0);
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<string>,
              { modelValue: ["a"], name: "a", listOrder: ["a", "b"], "data-tick": tick.value },
              { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
            );
        },
      }),
      { attachTo: document.body },
    );

    tick.value += 1;
    await nextTick();
    tick.value += 1;
    await nextTick();

    expect(warnings()).toEqual([expect.stringContaining("`listOrder` needs a `group`")]);
  });

  it("warns when two mounted lists share a group and a name", async () => {
    const props = { name: "twin", group: "twins", onMove: vi.fn() };
    mountWith(props, (attrs, id) => h("div", attrs, id));
    mountWith(props, (attrs, id) => h("div", attrs, id));
    await nextTick();

    expect(warnings()).toEqual([expect.stringContaining('share group "twins" and name "twin"')]);
  });

  it("warns when object items in a group have no `itemKey`", () => {
    mount(VcSortable<{ title: string }>, {
      props: { modelValue: [{ title: "a" }], name: "objects", group: "objects", onMove: vi.fn() },
      slots: { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
      attachTo: document.body,
    });

    expect(warnings()).toContainEqual(expect.stringContaining("object items need an `itemKey` here"));
  });

  it("stays silent for object items in a group that do pass an `itemKey`", () => {
    mount(VcSortable<{ title: string }>, {
      props: {
        modelValue: [{ title: "a" }],
        name: "keyed",
        group: "keyed",
        onMove: vi.fn(),
        itemKey: (item: { title: string }) => item.title,
      },
      slots: { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
      attachTo: document.body,
    });

    expect(warnings()).toEqual([]);
  });

  it("warns for object items in a list with `accepts` alone", () => {
    mount(VcSortable<{ title: string }>, {
      props: { modelValue: [{ title: "a" }], accepts: () => true },
      slots: { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
      attachTo: document.body,
    });

    expect(warnings()).toContainEqual(expect.stringContaining("object items need an `itemKey` here"));
  });

  it("warns when object items without an `itemKey` arrive after mount", async () => {
    const rows = ref<{ title: string }[]>([]);
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<{ title: string }>,
              { modelValue: rows.value, name: "late", group: "late", onMove: vi.fn() },
              { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
            );
        },
      }),
      { attachTo: document.body },
    );
    expect(warnings()).toEqual([]);

    rows.value = [{ title: "a" }];
    await nextTick();
    rows.value = [];
    await nextTick();
    rows.value = [{ title: "b" }];
    await nextTick();

    expect(warnings()).toEqual([expect.stringContaining("object items need an `itemKey` here")]);
  });

  it("warns when object items without an `itemKey` are pushed into the model in place", async () => {
    const rows = ref<{ title: string }[]>([]);
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<{ title: string }>,
              { modelValue: rows.value, name: "pushed", group: "pushed", onMove: vi.fn() },
              { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
            );
        },
      }),
      { attachTo: document.body },
    );

    rows.value.push({ title: "a" });
    await nextTick();

    expect(warnings()).toContainEqual(expect.stringContaining("object items need an `itemKey` here"));
  });

  it("warns once, not twice, for an item slot with two roots", () => {
    mountWith({ modelValue: ["a"] }, (attrs, id) => [h("div", attrs, id), h("span", "extra")]);

    expect(warnings()).toHaveLength(1);
  });

  it("warns when `filter` changes after mount", async () => {
    const filter = ref(".a");
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<string>,
              { modelValue: ["a"], filter: filter.value },
              { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
            );
        },
      }),
      { attachTo: document.body },
    );

    filter.value = ".b";
    await nextTick();

    expect(warnings()).toContainEqual(expect.stringContaining("read at mount"));
  });

  it("warns when two items share an id", () => {
    mountWith({ modelValue: ["a", "a"] }, (attrs, id) => h("div", attrs, id));

    expect(warnings()).toContainEqual(expect.stringContaining("two items share an id"));
  });

  it("warns when a mount-time option changes later", async () => {
    const handle = ref(".grip");
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<string>,
              { modelValue: ["a"], handle: handle.value },
              {
                item: ({ attrs }: { attrs: Record<string, unknown> }) =>
                  h("div", attrs, [h("i", { ...attrs, class: "vc-sortable__handle" })]),
              },
            );
        },
      }),
      { attachTo: document.body },
    );

    handle.value = ".other";
    await nextTick();

    expect(warnings()).toContainEqual(expect.stringContaining("read at mount"));
  });

  it("stays silent when `accepts` is a fresh inline function on each render", async () => {
    const tick = ref(0);
    mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VcSortable<string>,
              // Read here, so the parent re-renders and hands a new function.
              { modelValue: ["a"], "data-tick": tick.value, accepts: () => true },
              { item: ({ attrs }: { attrs: Record<string, unknown> }) => h("div", attrs) },
            );
        },
      }),
      { attachTo: document.body },
    );

    tick.value += 1;
    await nextTick();

    expect(warnings()).toEqual([]);
  });
});
