import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useSortableList } from "./useSortableList";
import type { ISortableListOptions, SortableMovePayloadType, SortableSignalType } from "./useSortableList";
import type { EffectScope } from "vue";

// Stand in for SortableJS: record what each list constructs with, so a gesture can be replayed through
// the real handlers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- replays SortableJS's option and event objects
const instances: { el: HTMLElement; options: Record<string, any>; option: ReturnType<typeof vi.fn> }[] = [];
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
    constructor(el: HTMLElement, options: Record<string, unknown>) {
      instances.push({ el, options, option: this.option });
    }
  },
}));

const scopes: EffectScope[] = [];

beforeEach(() => {
  instances.length = 0;
});

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.stop());
  document.body.innerHTML = "";
});

type SetupType = Partial<ISortableListOptions> & { initial?: string[] };

function setup({ initial = ["a", "b", "c"], ...overrides }: SetupType = {}) {
  let items = [...initial];
  const signals: SortableSignalType[] = [];
  const moves: SortableMovePayloadType[] = [];
  const scope = effectScope();
  scopes.push(scope);

  const list = scope.run(() =>
    useSortableList(null, {
      name: "main",
      items: () => items,
      orientation: "vertical",
      onReorder: (ids) => {
        items = ids;
      },
      onMove: (payload) => moves.push(payload),
      onAnnounce: (signal) => signals.push(signal),
      ...overrides,
    }),
  )!;

  // Keyboard goes through the item itself in a whole-item list, through the handle otherwise.
  const controlOf = (id: string) => (overrides.handle ? list.handleAttrs(id)! : list.itemAttrs(id));

  const press = (key: string, id: string, currentTarget?: HTMLElement) => {
    const event = { key, preventDefault: vi.fn(), currentTarget } as unknown as KeyboardEvent;
    controlOf(id).onKeydown!(event);
    return event;
  };

  const blur = (id: string) => controlOf(id).onBlur!();

  return { list, press, blur, signals, moves, order: () => items, scope };
}

describe("useSortableList — keyboard", () => {
  it("grabs and drops with Space, announcing the position", () => {
    const { list, press, signals } = setup();

    press(" ", "b");
    expect(list.isGrabbed("b")).toBe(true);
    expect(signals.at(-1)).toEqual({ kind: "grabbed", id: "b", index: 1, total: 3, canChangeList: false });

    press(" ", "b");
    expect(list.isGrabbed("b")).toBe(false);
    expect(signals.at(-1)).toEqual({ kind: "dropped", id: "b", index: 1, total: 3 });
  });

  it("grabs with Enter too", () => {
    const { list, press } = setup();

    press("Enter", "a");

    expect(list.isGrabbed("a")).toBe(true);
  });

  it("ignores arrows until something is grabbed", () => {
    const { press, order } = setup();

    press("ArrowDown", "a");

    expect(order()).toEqual(["a", "b", "c"]);
  });

  it("reorders with up/down in a vertical list", () => {
    const { press, order, signals } = setup();

    press(" ", "a");
    press("ArrowDown", "a");

    expect(order()).toEqual(["b", "a", "c"]);
    expect(signals.at(-1)).toEqual({ kind: "moved", id: "a", index: 1, total: 3 });
  });

  it("reorders with left/right in a horizontal list", () => {
    const { press, order } = setup({ orientation: "horizontal" });

    press(" ", "c");
    press("ArrowLeft", "c");

    expect(order()).toEqual(["a", "c", "b"]);
  });

  it("announces the edge instead of moving past either end", () => {
    const { press, order, signals } = setup();

    press(" ", "a");
    press("ArrowUp", "a");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(signals.at(-1)).toEqual({ kind: "edge", id: "a", index: 0, total: 3 });
  });

  it("puts the item back on Escape", () => {
    const { list, press, order, signals } = setup();

    press(" ", "a");
    press("ArrowDown", "a");
    press("ArrowDown", "a");
    expect(order()).toEqual(["b", "c", "a"]);

    press("Escape", "a");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(list.isGrabbed("a")).toBe(false);
    expect(signals.at(-1)).toEqual({ kind: "cancelled", id: "a" });
  });

  it("cancels on blur, so tabbing away cannot strand a half-finished move", async () => {
    const { list, press, blur, order } = setup();

    press(" ", "a");
    press("ArrowDown", "a");
    await nextTick();
    blur("a");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(list.isGrabbed("a")).toBe(false);
  });

  // Chrome and WebKit blur a focused node when Vue's patch moves it, which would otherwise cancel the
  // grab and snap the item back — arrows appearing to work in one direction only.
  it("ignores the blur its own reorder causes", () => {
    const { list, press, blur, order } = setup();

    press(" ", "a");
    press("ArrowDown", "a");
    blur("a");

    expect(order()).toEqual(["b", "a", "c"]);
    expect(list.isGrabbed("a")).toBe(true);
  });

  // Putting the item back moves its node, which blurs it — so Escape without a refocus drops the user at
  // the top of the page. Blur-cancel must not refocus, or tabbing away would be a trap.
  it("returns focus to the control on Escape but not on blur-cancel", async () => {
    const { list, press, blur, order } = setup();
    const control = document.createElement("button");
    const elsewhere = document.createElement("button");
    document.body.append(control, elsewhere);

    press(" ", "b", control);
    press("ArrowDown", "b", control);
    await nextTick();
    press("Escape", "b", control);
    control.blur();
    await nextTick();

    expect(order()).toEqual(["a", "b", "c"]);
    expect(document.activeElement).toBe(control);

    press(" ", "b", control);
    press("ArrowDown", "b", control);
    await nextTick();
    elsewhere.focus();
    blur("b");
    await nextTick();

    expect(list.isGrabbed("b")).toBe(false);
    expect(order()).toEqual(["a", "b", "c"]);
    expect(document.activeElement).toBe(elsewhere);
  });

  it("releases a grab without moving the item back", () => {
    const { list, press, signals, order } = setup();

    press(" ", "b");
    press("ArrowDown", "b");
    list.release();

    expect(list.isGrabbed("b")).toBe(false);
    expect(order()).toEqual(["a", "c", "b"]);
    expect(signals.map((signal) => signal.kind)).not.toContain("cancelled");
  });

  it("leaves the cross-axis arrows inert without a ring", () => {
    const { list, press, order, moves } = setup({ orientation: "horizontal" });

    press(" ", "b");
    press("ArrowDown", "b");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(moves).toEqual([]);
    expect(list.isGrabbed("b")).toBe(true);
  });

  // Space would scroll the page and the arrows would scroll it too, while the list is also acting on them.
  it("takes every key it acts on from the page", () => {
    const { press } = setup({ name: "keys", group: "keys", ring: ["keys", "other"] });
    setup({ name: "other", group: "keys", ring: ["keys", "other"] });

    expect(press(" ", "b").preventDefault).toHaveBeenCalled();
    expect(press("ArrowDown", "b").preventDefault).toHaveBeenCalled();
    expect(press("Escape", "b").preventDefault).toHaveBeenCalled();
    press(" ", "b");
    expect(press("ArrowRight", "b").preventDefault).toHaveBeenCalled();
  });

  it("only responds to the grabbed item's own control", () => {
    const { press, order } = setup();

    press(" ", "a");
    press("ArrowDown", "c");

    expect(order()).toEqual(["a", "b", "c"]);
  });
});

describe("useSortableList — moving between lists by keyboard", () => {
  function setupPair(targetAccepts?: (id: string, from: string) => boolean) {
    const ring = ["shown", "parked", "archived"];
    const source = setup({ name: "shown", group: "stats", ring, orientation: "horizontal" });
    setup({ name: "parked", group: "stats", ring, orientation: "horizontal", accepts: targetAccepts });
    return source;
  }

  it("announces that the grab can change lists", () => {
    const { press, signals } = setupPair();

    press(" ", "b");

    expect(signals.at(-1)).toMatchObject({ kind: "grabbed", canChangeList: true });
  });

  it("moves the item to the next list in the ring and lets go of it", () => {
    const { list, press, moves, signals, order } = setupPair();

    press(" ", "b");
    press("ArrowDown", "b");

    expect(moves).toEqual([{ id: "b", from: "shown", to: "parked" }]);
    expect(signals.at(-1)).toEqual({ kind: "movedList", id: "b", from: "shown", to: "parked" });
    expect(list.isGrabbed("b")).toBe(false);
    // The owner of both lists applies the move; this list's own order is untouched.
    expect(order()).toEqual(["a", "b", "c"]);
  });

  it("does not wrap past the start of the ring", () => {
    const { list, press, moves, signals } = setupPair();

    press(" ", "b");
    press("ArrowUp", "b");

    expect(moves).toEqual([]);
    expect(signals.at(-1)).toEqual({ kind: "noTarget", id: "b" });
    expect(list.isGrabbed("b")).toBe(true);
  });

  // The pointer asks the target through SortableJS `put`; the keyboard has to ask the same predicate.
  it("skips a list that refuses the item and moves on to the next one", () => {
    const ring = ["shown", "refuser", "parked"];
    const accepts = vi.fn(() => false);
    const source = setup({ name: "shown", group: "skip", ring, orientation: "horizontal" });
    setup({ name: "refuser", group: "skip", ring, orientation: "horizontal", accepts });
    setup({ name: "parked", group: "skip", ring, orientation: "horizontal" });

    source.press(" ", "b");
    source.press("ArrowDown", "b");

    expect(accepts).toHaveBeenCalledWith("b", "shown");
    expect(source.moves).toEqual([{ id: "b", from: "shown", to: "parked" }]);
  });

  it("skips a list that is not mounted, and one that is disabled", () => {
    const ring = ["shown", "absent", "off", "parked"];
    const source = setup({ name: "shown", group: "skip-2", ring, orientation: "horizontal" });
    setup({ name: "off", group: "skip-2", ring, orientation: "horizontal", enabled: false });
    setup({ name: "parked", group: "skip-2", ring, orientation: "horizontal" });

    source.press(" ", "b");
    source.press("ArrowDown", "b");

    expect(source.moves).toEqual([{ id: "b", from: "shown", to: "parked" }]);
  });

  it("announces that no list takes the item when every one in that direction refuses", () => {
    const { press, moves, signals } = setupPair(() => false);

    press(" ", "b");
    press("ArrowDown", "b");

    expect(moves).toEqual([]);
    expect(signals.at(-1)).toEqual({ kind: "noTarget", id: "b" });
  });

  // A list remounting under its own name registers before the one it replaces cleans up.
  it("keeps a list that took over a name when the old one goes", () => {
    const ring = ["shown", "parked"];
    const source = setup({ name: "shown", group: "stats-3", ring, orientation: "horizontal" });
    const old = setup({ name: "parked", group: "stats-3", ring, orientation: "horizontal" });
    setup({ name: "parked", group: "stats-3", ring, orientation: "horizontal" });

    old.scope.stop();
    source.press(" ", "a");
    source.press("ArrowDown", "a");

    expect(source.moves).toEqual([{ id: "a", from: "shown", to: "parked" }]);
  });

  it("forgets a list once its scope is disposed", () => {
    const ring = ["shown", "parked"];
    const source = setup({ name: "shown", group: "stats-2", ring, orientation: "horizontal" });
    const target = setup({ name: "parked", group: "stats-2", ring, orientation: "horizontal" });

    target.scope.stop();
    source.press(" ", "a");
    source.press("ArrowDown", "a");

    expect(source.moves).toEqual([]);
  });
});

describe("useSortableList — attributes", () => {
  it("makes the whole item the keyboard control while enabled", () => {
    const { list, press } = setup();

    expect(list.itemAttrs("a")).toMatchObject({
      "data-sortable-id": "a",
      class: "vc-sortable__item vc-sortable__item--whole",
      tabindex: "0",
      role: "button",
      "aria-pressed": "false",
    });
    expect(list.handleAttrs("a")).toBeNull();

    press(" ", "a");

    expect(list.itemAttrs("a")).toMatchObject({
      class: "vc-sortable__item vc-sortable__item--whole vc-sortable__item--grabbed",
      "aria-pressed": "true",
    });
  });

  it("hands the keyboard to the handle in a list that has one", () => {
    const { list, press } = setup({ handle: ".grip" });

    expect(list.itemAttrs("a")).toEqual({ "data-sortable-id": "a", class: "vc-sortable__item" });
    expect(list.handleAttrs("a")).toMatchObject({ class: "vc-sortable__handle", "aria-pressed": "false" });

    press(" ", "a");

    expect(list.itemAttrs("a").class).toBe("vc-sortable__item vc-sortable__item--grabbed");
    expect(list.handleAttrs("a")).toMatchObject({ "aria-pressed": "true" });
  });

  it("is inert while disabled, and lets go of a grab when it becomes disabled", async () => {
    const enabled = ref(true);
    const { list, press } = setup({ enabled });

    press(" ", "a");
    enabled.value = false;
    await nextTick();

    expect(list.isGrabbed("a")).toBe(false);
    expect(list.itemAttrs("a")).toEqual({ "data-sortable-id": "a", class: "" });
    expect(list.handleAttrs("a")).toBeNull();
  });
});

describe("useSortableList — pointer", () => {
  async function mounted(overrides: SetupType = {}) {
    const el = document.createElement("div");
    document.body.append(el);
    let items = [...(overrides.initial ?? ["a", "b", "c"])];
    for (const id of items) {
      const child = document.createElement("div");
      child.dataset.sortableId = id;
      el.append(child);
    }
    const trailing = document.createElement("p");
    el.append(trailing);
    const moves: SortableMovePayloadType[] = [];
    const container = ref<HTMLElement | null>(null);
    const scope = effectScope();
    scopes.push(scope);
    const list = scope.run(() =>
      useSortableList(container, {
        name: "main",
        items: () => items,
        onReorder: (ids) => {
          items = ids;
        },
        onMove: (payload) => moves.push(payload),
        ...overrides,
      }),
    )!;
    container.value = el;
    await nextTick();
    return { el, trailing, list, moves, order: () => items, sortable: instances.at(-1)! };
  }

  // A drop names its target by this attribute, so a caller rendering its own container must get it too.
  it("stamps the list's name on the container, and follows a rename", async () => {
    const name = ref("main");
    const { el } = await mounted({ name });

    expect(el.dataset.sortableName).toBe("main");

    name.value = "rail";
    await nextTick();

    expect(el.dataset.sortableName).toBe("rail");
  });

  it("wires the options the drag behaviour depends on", async () => {
    const { sortable } = await mounted({ handle: ".grip", filter: ".close", group: "g" });

    expect(sortable.options).toMatchObject({
      draggable: "[data-sortable-id]",
      group: "g",
      handle: ".grip",
      filter: ".close",
      preventOnFilter: false,
      ghostClass: "vc-sortable__item--ghost",
      dragClass: "vc-sortable__item--drag",
      disabled: false,
      // Without a touch hold, a swipe starting on an item drags instead of scrolling the page.
      delay: 200,
      delayOnTouchOnly: true,
    });
  });

  it("asks `accepts` through SortableJS `put` when the list has one", async () => {
    const accepts = vi.fn(() => false);
    const { sortable } = await mounted({ group: "g", accepts });
    const dragEl = document.createElement("div");
    dragEl.dataset.sortableId = "x";
    const fromEl = document.createElement("div");
    fromEl.dataset.sortableName = "rail";

    const { name, put } = sortable.options.group;

    expect(name).toBe("g");
    expect(put({}, { el: fromEl }, dragEl)).toBe(false);
    expect(accepts).toHaveBeenCalledWith("x", "rail");
  });

  it("toggles instead of rebuilding when enabled changes", async () => {
    const enabled = ref(false);
    const { sortable } = await mounted({ enabled });

    expect(sortable.options.disabled).toBe(true);

    enabled.value = true;
    await nextTick();

    expect(sortable.option).toHaveBeenCalledWith("disabled", false);
    expect(instances).toHaveLength(1);
  });

  // A pointer drag and a keyboard grab reordering the same array at once drops the wrong item.
  it("lets go of a keyboard grab when a pointer drag is chosen", async () => {
    const { list, sortable } = await mounted();

    list.itemAttrs("b").onKeydown!({ key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    sortable.options.onChoose();

    expect(list.isGrabbed("b")).toBe(false);
  });

  // Draggable indices, and the DOM put back exactly: the trailing non-item child must stay last.
  it("undoes the DOM move and reports the new order", async () => {
    const { el, trailing, order, sortable } = await mounted();
    const item = el.querySelector('[data-sortable-id="c"]') as HTMLElement;

    sortable.options.onStart({ item });
    el.insertBefore(item, el.firstChild);
    sortable.options.onUpdate({ from: el, to: el, item, oldIndex: 2, oldDraggableIndex: 2, newDraggableIndex: 0 });

    expect(order()).toEqual(["c", "a", "b"]);
    expect([...el.children].map((child) => (child as HTMLElement).dataset.sortableId ?? "p")).toEqual([
      "a",
      "b",
      "c",
      "p",
    ]);
    expect(el.lastChild).toBe(trailing);
  });

  it("reports a move to another list at the index it was dropped at, and puts the node back", async () => {
    const { el, moves, sortable } = await mounted();
    const other = document.createElement("div");
    other.dataset.sortableName = "parked";
    document.body.append(other);
    const item = el.querySelector('[data-sortable-id="a"]') as HTMLElement;

    sortable.options.onStart({ item });
    other.append(item);
    sortable.options.onEnd({ from: el, to: other, item, oldIndex: 0, newDraggableIndex: 0 });

    expect(moves).toEqual([{ id: "a", from: "main", to: "parked", index: 0 }]);
    expect(el.firstElementChild).toBe(item);
    expect(other.children).toHaveLength(0);
  });

  // Without the node's original neighbour (no `start` seen), the index is read after the node is removed.
  it("puts the node back by index on a backward move when no start was seen", async () => {
    const { el, sortable } = await mounted();
    const item = el.querySelector('[data-sortable-id="c"]') as HTMLElement;

    el.insertBefore(item, el.firstChild);
    sortable.options.onUpdate({ from: el, to: el, item, oldIndex: 2, oldDraggableIndex: 2, newDraggableIndex: 0 });

    expect([...el.children].map((child) => (child as HTMLElement).dataset.sortableId ?? "p")).toEqual([
      "a",
      "b",
      "c",
      "p",
    ]);
  });

  it("moves focus to the item in the list it was moved into by keyboard", async () => {
    const make = (name: string, ids: string[]) => {
      const el = document.createElement("div");
      for (const id of ids) {
        const child = document.createElement("div");
        child.dataset.sortableId = id;
        child.tabIndex = 0;
        el.append(child);
      }
      document.body.append(el);
      const scope = effectScope();
      scopes.push(scope);
      const list = scope.run(() =>
        useSortableList(el, {
          name,
          group: "focus",
          ring: ["shown", "parked"],
          orientation: "horizontal",
          items: () => ids,
          onReorder: vi.fn(),
          onMove: vi.fn(),
        }),
      )!;
      return { el, list };
    };
    const shown = make("shown", ["a"]);
    const parked = make("parked", ["a"]);

    const press = (key: string) =>
      shown.list.itemAttrs("a").onKeydown!({ key, preventDefault: vi.fn() } as unknown as KeyboardEvent);
    press(" ");
    press("ArrowDown");
    await nextTick();

    expect(document.activeElement).toBe(parked.el.firstElementChild);
  });

  it("leaves focus where the owner put it after a keyboard move between lists", async () => {
    const make = (name: string) => {
      const el = document.createElement("div");
      const child = document.createElement("div");
      child.dataset.sortableId = "a";
      child.tabIndex = 0;
      el.append(child);
      document.body.append(el);
      const scope = effectScope();
      scopes.push(scope);
      return scope.run(() =>
        useSortableList(el, {
          name,
          group: "focus-owner",
          ring: ["shown", "parked"],
          orientation: "horizontal",
          items: () => ["a"],
          onReorder: vi.fn(),
          onMove: () => owned.focus(),
        }),
      )!;
    };
    const owned = document.createElement("button");
    document.body.append(owned);
    const shown = make("shown");
    make("parked");

    const press = (key: string) =>
      shown.itemAttrs("a").onKeydown!({ key, preventDefault: vi.fn() } as unknown as KeyboardEvent);
    press(" ");
    press("ArrowDown");
    await nextTick();

    expect(document.activeElement).toBe(owned);
  });

  it("does nothing on the end of a drag that stayed in its list", async () => {
    const { el, moves, sortable } = await mounted();
    const item = el.querySelector('[data-sortable-id="a"]') as HTMLElement;

    sortable.options.onEnd({ from: el, to: el, item, oldIndex: 0, newDraggableIndex: 1 });

    expect(moves).toEqual([]);
  });
});
