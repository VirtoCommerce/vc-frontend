import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useSortableList } from "./useSortableList";
import type { IUseSortableListOptions, SortableMovePayloadType, SortableSignalType } from "./useSortableList";
import type { EffectScope } from "vue";

// Stand in for SortableJS: record what each list constructs with, so a gesture can be replayed through
// the real handlers.
const instances: {
  el: HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- replays SortableJS's option and event objects
  options: Record<string, any>;
  option: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}[] = [];
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
    constructor(el: HTMLElement, options: Record<string, unknown>) {
      instances.push({ el, options, option: this.option, destroy: this.destroy });
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

type SetupType = Partial<IUseSortableListOptions> & { initial?: string[] };

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

    press(" ", "a");
    press(" ", "c");
    press("ArrowDown", "c");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(signals.at(-1)).toEqual({ kind: "edge", id: "c", index: 2, total: 3 });
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

  it("leaves the cross-axis arrows inert without a list order", () => {
    const { list, press, order, moves } = setup({ orientation: "horizontal" });

    press(" ", "b");
    press("ArrowDown", "b");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(moves).toEqual([]);
    expect(list.isGrabbed("b")).toBe(true);
  });

  // Space would scroll the page and the arrows would scroll it too, while the list is also acting on them.
  it("takes every key it acts on from the page", () => {
    const { press } = setup({ name: "keys", group: "keys", listOrder: ["keys", "other"] });
    setup({ name: "other", group: "keys", listOrder: ["keys", "other"] });

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

  it("leaves keys from a control inside a whole item to that control", () => {
    const { list, press, order } = setup();
    const item = document.createElement("div");
    const field = item.appendChild(document.createElement("input"));
    const fromField = (key: string) => {
      const event = { key, preventDefault: vi.fn(), target: field, currentTarget: item } as unknown as KeyboardEvent;
      list.itemAttrs("a").onKeydown!(event);
      return event;
    };

    expect(fromField(" ").preventDefault).not.toHaveBeenCalled();
    expect(list.isGrabbed("a")).toBe(false);

    press(" ", "a", item);
    fromField("ArrowDown");

    expect(order()).toEqual(["a", "b", "c"]);
  });
});

describe("useSortableList — moving between lists by keyboard", () => {
  function setupPair(targetAccepts?: (id: string, from: string) => boolean) {
    const order = ["shown", "parked", "archived"];
    const source = setup({ name: "shown", group: "stats", listOrder: order, orientation: "horizontal" });
    const target = setup({
      name: "parked",
      group: "stats",
      listOrder: order,
      orientation: "horizontal",
      accepts: targetAccepts,
      initial: ["x"],
    });
    return { ...source, target };
  }

  it("announces that the grab can change lists", () => {
    const { press, signals } = setupPair();

    press(" ", "b");

    expect(signals.at(-1)).toMatchObject({ kind: "grabbed", canChangeList: true });
  });

  it("treats a list order of one list as no list order", () => {
    const { press, signals } = setup({ name: "solo", group: "solo", listOrder: ["solo"] });

    press(" ", "b");
    expect(signals.at(-1)).toMatchObject({ kind: "grabbed", canChangeList: false });

    signals.length = 0;
    expect(press("ArrowRight", "b").preventDefault).not.toHaveBeenCalled();
    expect(signals).toEqual([]);
  });

  it("moves the item to the next list in the list order and hands the grab over with it", () => {
    const { list, press, moves, signals, order, target } = setupPair();

    press(" ", "b");
    press("ArrowDown", "b");

    expect(moves).toEqual([{ id: "b", from: "shown", to: "parked" }]);
    expect(signals.at(-1)).toEqual({ kind: "movedList", id: "b", from: "shown", to: "parked", dropped: false });
    expect(list.isGrabbed("b")).toBe(false);
    expect(target.list.isGrabbed("b")).toBe(true);
    // The owner of both lists applies the move; this list's own order is untouched.
    expect(order()).toEqual(["a", "b", "c"]);
  });

  it("ends the grab on arrival when the list the item leaves drops on a list change", () => {
    const order = ["shown", "parked"];
    const releases: string[] = [];
    const source = setup({
      name: "shown",
      group: "drop",
      listOrder: order,
      orientation: "horizontal",
      dropOnListChange: true,
      onRelease: ({ id }) => releases.push(id),
    });
    const target = setup({ name: "parked", group: "drop", listOrder: order, orientation: "horizontal", initial: [] });

    source.press(" ", "b");
    source.press("ArrowDown", "b");

    expect(source.moves).toEqual([{ id: "b", from: "shown", to: "parked" }]);
    expect(source.signals.at(-1)).toEqual({ kind: "movedList", id: "b", from: "shown", to: "parked", dropped: true });
    expect(releases).toEqual(["b"]);
    expect(target.list.isGrabbed("b")).toBe(false);
  });

  it("carries the grab out of a list that does not drop, even into one that does", () => {
    const order = ["shown", "parked"];
    const source = setup({ name: "shown", group: "drop-2", listOrder: order, orientation: "horizontal" });
    const target = setup({
      name: "parked",
      group: "drop-2",
      listOrder: order,
      orientation: "horizontal",
      dropOnListChange: true,
      initial: [],
    });

    source.press(" ", "b");
    source.press("ArrowDown", "b");

    expect(source.signals.at(-1)).toMatchObject({ kind: "movedList", dropped: false });
    expect(target.list.isGrabbed("b")).toBe(true);
  });

  it("lets the grab go when the owner does not apply the move", async () => {
    const { press, target } = setupPair();

    press(" ", "b");
    press("ArrowDown", "b");
    await nextTick();

    // This harness's owner records moves without applying them, so "parked" never receives the item.
    expect(target.list.isGrabbed("b")).toBe(false);
  });

  it("does not wrap past the start of the list order", () => {
    const { list, press, moves, signals } = setupPair();

    press(" ", "b");
    press("ArrowUp", "b");

    expect(moves).toEqual([]);
    expect(signals.at(-1)).toEqual({ kind: "noTarget", id: "b" });
    expect(list.isGrabbed("b")).toBe(true);
  });

  // The pointer asks the target through SortableJS `put`; the keyboard has to ask the same predicate.
  it("skips a list that refuses the item and moves on to the next one", () => {
    const order = ["shown", "refuser", "parked"];
    const accepts = vi.fn(() => false);
    const source = setup({ name: "shown", group: "skip", listOrder: order, orientation: "horizontal" });
    setup({ name: "refuser", group: "skip", listOrder: order, orientation: "horizontal", accepts });
    setup({ name: "parked", group: "skip", listOrder: order, orientation: "horizontal" });

    source.press(" ", "b");
    source.press("ArrowDown", "b");

    expect(accepts).toHaveBeenCalledWith("b", "shown");
    expect(source.moves).toEqual([{ id: "b", from: "shown", to: "parked" }]);
  });

  it("skips a list that is not mounted, and one that is disabled", () => {
    const order = ["shown", "absent", "off", "parked"];
    const source = setup({ name: "shown", group: "skip-2", listOrder: order, orientation: "horizontal" });
    setup({ name: "off", group: "skip-2", listOrder: order, orientation: "horizontal", disabled: true });
    setup({ name: "parked", group: "skip-2", listOrder: order, orientation: "horizontal" });

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
    const order = ["shown", "parked"];
    const source = setup({ name: "shown", group: "stats-3", listOrder: order, orientation: "horizontal" });
    const old = setup({ name: "parked", group: "stats-3", listOrder: order, orientation: "horizontal" });
    setup({ name: "parked", group: "stats-3", listOrder: order, orientation: "horizontal" });

    old.scope.stop();
    source.press(" ", "a");
    source.press("ArrowDown", "a");

    expect(source.moves).toEqual([{ id: "a", from: "shown", to: "parked" }]);
  });

  it("warns about a name taken over only while both lists stay mounted", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const old = setup({ name: "parked", group: "stats-5" });
    setup({ name: "parked", group: "stats-5" });
    old.scope.stop();
    await nextTick();
    const silentOnRemount = warn.mock.calls.length;

    setup({ name: "parked", group: "stats-5" });
    await nextTick();

    expect([silentOnRemount, warn.mock.calls.length]).toEqual([0, 1]);
    warn.mockRestore();
  });

  // A stale cleanup must not delete the group's map that a newer list has since created.
  it("keeps a list that registered after its group emptied, when an older one goes", () => {
    const order = ["shown", "parked"];
    const older = setup({ name: "parked", group: "stats-4", listOrder: order, orientation: "horizontal" });
    const taker = setup({ name: "parked", group: "stats-4", listOrder: order, orientation: "horizontal" });
    taker.scope.stop();
    setup({ name: "parked", group: "stats-4", listOrder: order, orientation: "horizontal" });
    const source = setup({ name: "shown", group: "stats-4", listOrder: order, orientation: "horizontal" });

    older.scope.stop();
    source.press(" ", "a");
    source.press("ArrowDown", "a");

    expect(source.moves).toEqual([{ id: "a", from: "shown", to: "parked" }]);
  });

  it("forgets a list once its scope is disposed", () => {
    const order = ["shown", "parked"];
    const source = setup({ name: "shown", group: "stats-2", listOrder: order, orientation: "horizontal" });
    const target = setup({ name: "parked", group: "stats-2", listOrder: order, orientation: "horizontal" });

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
    const disabled = ref(false);
    const { list, press } = setup({ disabled });

    press(" ", "a");
    disabled.value = true;
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

  it("destroys the SortableJS instance with its scope", async () => {
    const { sortable } = await mounted();

    scopes.at(-1)!.stop();

    expect(sortable.destroy).toHaveBeenCalledOnce();
  });

  it("hands SortableJS a new group without rebuilding", async () => {
    const group = ref("first");
    const { sortable } = await mounted({ group });

    group.value = "second";
    await nextTick();

    expect(sortable.option).toHaveBeenCalledWith("group", "second");
    expect(instances).toHaveLength(1);
  });

  it("keeps `accepts` on a group handed over live", async () => {
    const group = ref("first");
    const accepts = vi.fn(() => false);
    const { sortable } = await mounted({ group, accepts });
    const dragEl = document.createElement("div");
    dragEl.dataset.sortableId = "x";
    const fromEl = document.createElement("div");
    fromEl.dataset.sortableName = "rail";

    group.value = "second";
    await nextTick();

    const [key, { name, put }] = sortable.option.mock.calls.at(-1)!;

    expect([key, name]).toEqual(["group", "second"]);
    expect(put({}, { el: fromEl }, dragEl)).toBe(false);
    expect(accepts).toHaveBeenCalledWith("x", "rail");
  });

  it("wires the options the drag behaviour depends on", async () => {
    const { sortable } = await mounted({ handle: ".grip", filter: ".close", group: "g" });

    expect(sortable.options).toMatchObject({
      draggable: "[data-sortable-id]",
      group: "g",
      handle: ".vc-sortable__handle, .grip",
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

  // SortableJS reads `true` from a function-form `put` as "any group", which would let a foreign list drop in.
  it("keeps items from another group out when `accepts` allows them", async () => {
    const { default: RealSortable } = await vi.importActual<{ default: typeof import("sortablejs") }>("sortablejs");
    const { sortable } = await mounted({ group: "g", accepts: () => true });
    const dragEl = document.createElement("div");
    const to = new RealSortable(document.createElement("div"), { group: sortable.options.group });
    const sameGroup = new RealSortable(document.createElement("div"), { group: "g" });
    const otherGroup = new RealSortable(document.createElement("div"), { group: "other" });
    const checkPut = (from: InstanceType<typeof RealSortable>) =>
      (to.options.group as unknown as { checkPut: (...args: unknown[]) => boolean }).checkPut(to, from, dragEl);

    expect([checkPut(sameGroup), checkPut(otherGroup)].map(Boolean)).toEqual([true, false]);
  });

  it("toggles instead of rebuilding when disabled changes", async () => {
    const disabled = ref(true);
    const { sortable } = await mounted({ disabled });

    expect(sortable.options.disabled).toBe(true);

    disabled.value = false;
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
          listOrder: ["shown", "parked"],
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
          listOrder: ["shown", "parked"],
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

describe("useSortableList — grab and release events", () => {
  function withEvents(overrides: SetupType = {}) {
    const events: string[] = [];
    const list = setup({
      onGrab: ({ id, from }) => events.push(`grab ${id} ${from}`),
      onRelease: ({ id }) => events.push(`release ${id}`),
      ...overrides,
    });
    return { ...list, events };
  }

  it("reports a keyboard grab and its drop", () => {
    const { press, events } = withEvents();

    press(" ", "b");
    press(" ", "b");

    expect(events).toEqual(["grab b main", "release b"]);
  });

  it("reports a cancelled grab as released", () => {
    const { press, blur, events } = withEvents();

    press(" ", "a");
    press("Escape", "a");
    press(" ", "b");
    blur("b");

    expect(events).toEqual(["grab a main", "release a", "grab b main", "release b"]);
  });

  it("reports a grab ended by the list turning disabled", async () => {
    const disabled = ref(false);
    const { press, events } = withEvents({ disabled });

    press(" ", "a");
    disabled.value = true;
    await nextTick();

    expect(events).toEqual(["grab a main", "release a"]);
  });

  // Carried, not ended: the grab goes on in the sibling, which reports its end.
  it("reports no release when the grab is carried into a sibling list", async () => {
    const order = ["shown", "parked"];
    const events: string[] = [];
    const record = { onGrab: ({ id }: { id: string }) => events.push(`grab ${id}`) };
    const source = setup({
      ...record,
      name: "shown",
      group: "events",
      listOrder: order,
      orientation: "horizontal",
      onRelease: ({ id }) => events.push(`release ${id} shown`),
    });
    let parked: string[] = [];
    const target = setup({
      ...record,
      name: "parked",
      group: "events",
      listOrder: order,
      orientation: "horizontal",
      initial: [],
      onRelease: ({ id }) => events.push(`release ${id} parked`),
      items: () => parked,
      onReorder: (ids) => {
        parked = ids;
      },
    });

    source.press(" ", "a");
    parked = ["a"];
    source.press("ArrowDown", "a");
    await nextTick();
    target.press(" ", "a");

    expect(events).toEqual(["grab a", "release a parked"]);
  });

  function pointer(overrides: SetupType = {}) {
    const el = document.createElement("div");
    document.body.append(el);
    const item = document.createElement("div");
    item.dataset.sortableId = "a";
    el.append(item);
    const events: string[] = [];
    const container = ref<HTMLElement | null>(null);
    const scope = effectScope();
    scopes.push(scope);
    const list = scope.run(() =>
      useSortableList(container, {
        name: "main",
        items: () => ["a"],
        onReorder: vi.fn(),
        onGrab: ({ id, from }) => events.push(`grab ${id} ${from}`),
        onRelease: ({ id }) => events.push(`release ${id}`),
        ...overrides,
      }),
    )!;
    container.value = el;
    const key = (name: string) =>
      list.itemAttrs("a").onKeydown!({ key: name, preventDefault: vi.fn() } as unknown as KeyboardEvent);
    return { el, item, events, list, key, scope, sortable: () => instances.at(-1)! };
  }

  it("reports a pointer drag from its start to its end", async () => {
    const { el, item, events, sortable } = pointer();
    await nextTick();

    sortable().options.onStart({ item, from: el });
    expect(events).toEqual(["grab a main"]);

    sortable().options.onEnd({ item, from: el, to: el });
    expect(events).toEqual(["grab a main", "release a"]);
  });

  it("drags by the handle element itself with `handle: true`", async () => {
    const { sortable } = pointer({ handle: true });
    await nextTick();

    expect(sortable().options.handle).toBe(".vc-sortable__handle");
  });

  it("adds what a handle selector matches to the handle element's grip", async () => {
    const { sortable } = pointer({ handle: ".grip" });
    await nextTick();

    expect(sortable().options.handle).toBe(".vc-sortable__handle, .grip");
  });

  // An empty selector names no grip, so the whole item drags, as it always did.
  it.each([[""], ["  "]])("drags by the whole item with a blank handle selector %j", async (handle) => {
    const { sortable, list } = pointer({ handle });
    await nextTick();

    expect([sortable().options.handle, list.itemAttrs("a").tabindex]).toEqual([undefined, "0"]);
  });

  it("reports a keyboard grab ended by a pointer press", async () => {
    const { key, events, sortable } = pointer();
    await nextTick();

    key(" ");
    sortable().options.onChoose();

    expect(events).toEqual(["grab a main", "release a"]);
  });

  it("reports a grab ended by the caller's `release`", () => {
    const { key, events, list } = pointer();

    key(" ");
    list.release();

    expect(events).toEqual(["grab a main", "release a"]);
  });

  it("reports a grab ended by the list unmounting", () => {
    const { key, events, scope } = pointer();

    key(" ");
    scope.stop();

    expect(events).toEqual(["grab a main", "release a"]);
  });

  it("reports a pointer drag ended by the list unmounting", async () => {
    const { el, item, events, scope, sortable } = pointer();
    await nextTick();

    sortable().options.onStart({ item, from: el });
    scope.stop();

    expect(events).toEqual(["grab a main", "release a"]);
  });

  it("reports nothing on unmount after a pointer drag has ended", async () => {
    const { el, item, events, scope, sortable } = pointer();
    await nextTick();

    sortable().options.onStart({ item, from: el });
    sortable().options.onEnd({ item, from: el, to: el });
    scope.stop();

    expect(events).toEqual(["grab a main", "release a"]);
  });

  it("reports a grab ended by the held item leaving the list", async () => {
    const ids = ref(["a", "b"]);
    const { press, events } = withEvents({ items: () => ids.value });

    press(" ", "a");
    ids.value = ["b"];
    await nextTick();

    expect(events).toEqual(["grab a main", "release a"]);
  });

  // A shown list and a parked one; the owner applies a move only when `apply` says so.
  function carry({ apply = true } = {}) {
    const order = ["shown", "parked"];
    const events: string[] = [];
    let parked: string[] = [];
    const shown = pointer({
      name: "shown",
      group: "exits",
      listOrder: order,
      orientation: "horizontal",
      onRelease: ({ id }) => events.push(`release ${id} shown`),
      onMove: ({ id, to }) => {
        if (apply && to === "parked") {
          parked = [...parked, id];
        }
      },
    });
    const target = setup({
      name: "parked",
      group: "exits",
      listOrder: order,
      orientation: "horizontal",
      onRelease: ({ id }) => events.push(`release ${id} parked`),
      items: () => parked,
      onReorder: (ids) => {
        parked = ids;
      },
    });
    return { shown, target, events };
  }

  it("reports a carried grab cancelled back home from the list holding it", async () => {
    const { shown, target, events } = carry();
    await nextTick();

    shown.key(" ");
    shown.key("ArrowDown");
    await nextTick();
    target.press("Escape", "a");

    expect(events).toEqual(["release a parked"]);
  });

  it("reports a carried grab the owner refused", async () => {
    const { shown, events } = carry({ apply: false });
    await nextTick();

    shown.key(" ");
    shown.key("ArrowDown");
    await nextTick();

    expect(events).toEqual(["release a parked"]);
  });

  it("reports a carried grab ended by a press in the list it came from", async () => {
    const { shown, events } = carry();
    await nextTick();

    shown.key(" ");
    shown.key("ArrowDown");
    await nextTick();
    shown.sortable().options.onChoose();

    expect(events).toEqual(["release a parked"]);
  });
});

// Released outside every list, a native drop is a cancel to the browser, which flies the drag image
// back to its start; the item has to go back there too, not land where the placeholder last showed.
describe("useSortableList — a pointer drop outside every list", () => {
  it("puts the item back where the drag started", async () => {
    const el = document.createElement("div");
    document.body.append(el);
    const container = ref<HTMLElement | null>(el);
    const scope = effectScope();
    scopes.push(scope);
    scope.run(() => useSortableList(container, { name: "main", items: () => ["a"], onReorder: vi.fn() }));
    await nextTick();

    expect(instances.at(-1)!.options.revertOnSpill).toBe(true);
  });
});
