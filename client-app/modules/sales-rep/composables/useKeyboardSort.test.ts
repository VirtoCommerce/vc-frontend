import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useKeyboardSort } from "./useKeyboardSort";
import type { KeyboardSortOrientationType, KeyboardSortSignalType } from "../types/layout";

function setup(orientation: KeyboardSortOrientationType, withHiding = false) {
  let items = ["a", "b", "c"];
  const signals: KeyboardSortSignalType[] = [];
  const onToggleHidden = vi.fn();

  const sort = useKeyboardSort({
    orientation,
    items: () => items,
    onReorder: (id, index) => {
      items = items.filter((candidate) => candidate !== id);
      items.splice(index, 0, id);
    },
    onToggleHidden: withHiding ? onToggleHidden : undefined,
    onSignal: (signal) => signals.push(signal),
  });

  const press = (key: string, id: string) => {
    const event = { key, preventDefault: vi.fn(), currentTarget: undefined } as unknown as KeyboardEvent;
    sort.onKeydown(event, id);
    return event;
  };

  return { sort, press, signals, onToggleHidden, order: () => items };
}

describe("useKeyboardSort", () => {
  it("grabs and drops with Space, announcing position", () => {
    const { sort, press, signals } = setup("vertical");

    press(" ", "b");
    expect(sort.isGrabbed("b")).toBe(true);
    expect(signals.at(-1)).toEqual({ kind: "grabbed", id: "b", index: 1, total: 3, parkable: false });

    press(" ", "b");
    expect(sort.isGrabbed("b")).toBe(false);
    expect(signals.at(-1)).toMatchObject({ kind: "dropped", id: "b" });
  });

  it("grabs with Enter too", () => {
    const { sort, press } = setup("vertical");

    press("Enter", "a");
    expect(sort.isGrabbed("a")).toBe(true);
  });

  it("ignores arrows until something is grabbed", () => {
    const { press, order } = setup("vertical");

    press("ArrowDown", "a");
    expect(order()).toEqual(["a", "b", "c"]);
  });

  it("reorders with up/down in a vertical region", () => {
    const { press, order, signals } = setup("vertical");

    press(" ", "a");
    press("ArrowDown", "a");

    expect(order()).toEqual(["b", "a", "c"]);
    expect(signals.at(-1)).toEqual({ kind: "moved", id: "a", index: 1, total: 3 });
  });

  it("reorders with left/right in a horizontal region", () => {
    const { press, order } = setup("horizontal");

    press(" ", "c");
    press("ArrowLeft", "c");

    expect(order()).toEqual(["a", "c", "b"]);
  });

  it("does not reorder past either end", () => {
    const { press, order } = setup("vertical");

    press(" ", "a");
    press("ArrowUp", "a");

    expect(order()).toEqual(["a", "b", "c"]);
  });

  it("Escape restores the position the block was grabbed from", () => {
    const { sort, press, order, signals } = setup("vertical");

    press(" ", "a");
    press("ArrowDown", "a");
    press("ArrowDown", "a");
    expect(order()).toEqual(["b", "c", "a"]);

    press("Escape", "a");
    expect(order()).toEqual(["a", "b", "c"]);
    expect(sort.isGrabbed("a")).toBe(false);
    expect(signals.at(-1)).toEqual({ kind: "cancelled", id: "a" });
  });

  it("blur cancels, so tabbing away cannot strand a half-finished move", async () => {
    const { sort, press, order } = setup("vertical");

    press(" ", "a");
    press("ArrowDown", "a");
    await nextTick();
    sort.onBlur("a");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(sort.isGrabbed("a")).toBe(false);
  });

  // Chrome and WebKit blur a focused node when Vue's patch moves it, which would otherwise cancel the
  // grab and snap the block back — arrows appearing to work in one direction only.
  it("ignores the blur its own reorder causes", () => {
    const { sort, press, order } = setup("vertical");

    press(" ", "a");
    press("ArrowDown", "a");
    sort.onBlur("a");

    expect(order()).toEqual(["b", "a", "c"]);
    expect(sort.isGrabbed("a")).toBe(true);
  });

  // The grab announcement is the only place the arrow keys are spelled out, so it has to know that
  // this region can also park a block.
  it("reports a parkable grab where hiding is wired", () => {
    const { press, signals } = setup("horizontal", true);

    press(" ", "b");

    expect(signals.at(-1)).toMatchObject({ kind: "grabbed", parkable: true });
  });

  it("parks a grabbed stat with ArrowDown and releases the grab", () => {
    const { sort, press, onToggleHidden, signals } = setup("horizontal", true);

    press(" ", "b");
    press("ArrowDown", "b");

    expect(onToggleHidden).toHaveBeenCalledWith("b", true);
    expect(sort.isGrabbed("b")).toBe(false);
    expect(signals.at(-1)).toEqual({ kind: "parked", id: "b" });
  });

  it("restores a grabbed stat with ArrowUp", () => {
    const { press, onToggleHidden, signals } = setup("horizontal", true);

    press(" ", "b");
    press("ArrowUp", "b");

    expect(onToggleHidden).toHaveBeenCalledWith("b", false);
    expect(signals.at(-1)).toEqual({ kind: "restored", id: "b" });
  });

  it("leaves up/down inert in a horizontal region that cannot hide blocks", () => {
    const { sort, press, order } = setup("horizontal");

    press(" ", "b");
    press("ArrowDown", "b");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(sort.isGrabbed("b")).toBe(true);
  });

  it("only responds to the grabbed block's own handle", () => {
    const { press, order } = setup("vertical");

    press(" ", "a");
    press("ArrowDown", "c");

    expect(order()).toEqual(["a", "b", "c"]);
  });
});
