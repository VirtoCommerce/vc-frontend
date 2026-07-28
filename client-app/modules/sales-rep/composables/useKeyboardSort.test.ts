import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useKeyboardSort } from "./useKeyboardSort";
import type { KeyboardSortOrientationType, KeyboardSortSignalType } from "../types/layout";

// `hidden` is the state the list's own blocks already have — the zone's, as the region reports it.
function setup(orientation: KeyboardSortOrientationType, withHiding = false, hidden?: boolean) {
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
    hidden: hidden === undefined ? undefined : () => hidden,
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
    const { sort, press, onToggleHidden, signals } = setup("horizontal", true, false);

    press(" ", "b");
    press("ArrowDown", "b");

    expect(onToggleHidden).toHaveBeenCalledWith("b", true);
    expect(sort.isGrabbed("b")).toBe(false);
    expect(signals.at(-1)).toEqual({ kind: "parked", id: "b" });
  });

  it("restores a grabbed stat with ArrowUp", () => {
    const { press, onToggleHidden, signals } = setup("horizontal", true, true);

    press(" ", "b");
    press("ArrowUp", "b");

    expect(onToggleHidden).toHaveBeenCalledWith("b", false);
    expect(signals.at(-1)).toEqual({ kind: "restored", id: "b" });
  });

  // The direction leading out of the zone the block is already in is not a move. Acting on it appends
  // the block to the end of its own half, drops the grab, and announces a park or restore that never
  // happened — all from a keypress the user reads as doing nothing.
  it.each([
    ["ArrowUp", false, "restored"],
    ["ArrowDown", true, "parked"],
  ])("ignores %s in a zone whose blocks are already in that state", (key, zoneHidden, wrongSignal) => {
    const { sort, press, onToggleHidden, signals, order } = setup("horizontal", true, zoneHidden);

    press(" ", "b");
    press(key, "b");

    expect(onToggleHidden).not.toHaveBeenCalled();
    expect(order()).toEqual(["a", "b", "c"]);
    // The grab survives, and nothing is announced beyond the original grab.
    expect(sort.isGrabbed("b")).toBe(true);
    expect(signals.map((signal) => signal.kind)).not.toContain(wrongSignal);
  });

  // Putting the block back moves its node, which blurs it — so Escape without a refocus drops the
  // user at the top of the page. Blur-cancel must not refocus, or tabbing away would be a trap.
  it("returns focus to the handle on Escape but not on blur-cancel", async () => {
    const { sort, order } = setup("horizontal", true, false);
    const handle = document.createElement("button");
    const elsewhere = document.createElement("button");
    document.body.append(handle, elsewhere);

    const at = (target: HTMLElement, key: string) =>
      ({ key, preventDefault: vi.fn(), currentTarget: target }) as unknown as KeyboardEvent;

    sort.onKeydown(at(handle, " "), "b");
    sort.onKeydown(at(handle, "ArrowRight"), "b");
    await nextTick();

    sort.onKeydown(at(handle, "Escape"), "b");
    // What the browser does when Vue moves the node back; only cancel's own refocus can undo it.
    handle.blur();
    await nextTick();

    expect(order()).toEqual(["a", "b", "c"]);
    expect(document.activeElement).toBe(handle);

    // Blur path. The move's own refocus has to settle first — that window is deliberately ignored —
    // and then the user genuinely moves focus away.
    sort.onKeydown(at(handle, " "), "b");
    sort.onKeydown(at(handle, "ArrowRight"), "b");
    await nextTick();
    elsewhere.focus();
    sort.onBlur("b");
    await nextTick();

    expect(sort.isGrabbed("b")).toBe(false);
    expect(order()).toEqual(["a", "b", "c"]);
    // Focus stays where the user put it; pulling it back would make tabbing away impossible.
    expect(document.activeElement).toBe(elsewhere);

    handle.remove();
    elsewhere.remove();
  });

  it("announces the boundary instead of going silent at the end of the list", () => {
    const { press, signals, order } = setup("horizontal", true, false);

    press(" ", "a");
    press("ArrowLeft", "a");

    expect(order()).toEqual(["a", "b", "c"]);
    expect(signals.at(-1)).toEqual({ kind: "edge", id: "a", index: 0, total: 3 });
  });

  // Leaving edit mode unmounts the handles, and browsers fire no blur for an unmounted element — so
  // the grab has to be dropped explicitly or it outlives the UI that created it.
  it("release drops the grab without moving the block back", () => {
    const { sort, press, signals, order } = setup("horizontal", true, false);

    press(" ", "b");
    press("ArrowRight", "b");
    expect(order()).toEqual(["a", "c", "b"]);

    sort.release();

    expect(sort.isGrabbed("b")).toBe(false);
    expect(order()).toEqual(["a", "c", "b"]);
    expect(signals.map((signal) => signal.kind)).not.toContain("cancelled");
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
