import { nextTick, readonly, ref } from "vue";
import type { KeyboardSortOrientationType, KeyboardSortSignalType } from "../types/layout";

interface IUseKeyboardSortOptions {
  /** Stat rows read left-to-right; widget columns read top-to-bottom. Decides which arrows reorder. */
  orientation: KeyboardSortOrientationType;
  /** Current ids of the list being sorted, in render order. */
  items: () => string[];
  /** Move `id` to `index` within the list. */
  onReorder: (id: string, index: number) => void;
  /**
   * Park or restore a block. Only wired for horizontal regions, where ↑/↓ are free because they are
   * not reordering keys — that is what makes the stat row's visible/hidden zones keyboard-reachable.
   */
  onToggleHidden?: (id: string, hidden: boolean) => void;
  /** Emitted for every state change so the caller can localize and announce it. */
  onSignal: (signal: KeyboardSortSignalType) => void;
}

/**
 * Grab-and-move sorting for keyboard users: Space/Enter grabs, arrows move, Space/Enter drops,
 * Escape restores the original position. Blur cancels too, so tabbing away can never strand a
 * half-finished move.
 *
 * Pointer users get the same result through SortableJS; this is the accessible path to it, not a
 * fallback — the design prototype had no keyboard story at all, so the semantics are defined here.
 */
export function useKeyboardSort(options: IUseKeyboardSortOptions) {
  const grabbedId = ref<string | undefined>();
  const originIndex = ref(-1);

  function isGrabbed(id: string): boolean {
    return grabbedId.value === id;
  }

  // Vue reorders by moving the node with `insertBefore`, which blurs it in Chrome and WebKit. Since
  // blur cancels a grab, an unguarded move would snap the block straight back — visible as arrows
  // that work one way only, because Vue's diff moves the element that ends up earlier and leaves its
  // neighbour alone. Ignore that self-inflicted blur until the queued refocus has run.
  let refocusing = false;

  function refocus(handle: HTMLElement | undefined): void {
    refocusing = true;
    void nextTick(() => {
      handle?.focus();
      refocusing = false;
    });
  }

  function grab(id: string): void {
    const items = options.items();
    const index = items.indexOf(id);
    if (index < 0) {
      return;
    }
    grabbedId.value = id;
    originIndex.value = index;
    options.onSignal({ kind: "grabbed", id, index, total: items.length, parkable: !!options.onToggleHidden });
  }

  function drop(): void {
    const id = grabbedId.value;
    if (!id) {
      return;
    }
    const items = options.items();
    grabbedId.value = undefined;
    options.onSignal({ kind: "dropped", id, index: items.indexOf(id), total: items.length });
  }

  function cancel(): void {
    const id = grabbedId.value;
    if (!id) {
      return;
    }
    options.onReorder(id, originIndex.value);
    grabbedId.value = undefined;
    options.onSignal({ kind: "cancelled", id });
  }

  function step(delta: number, handle: HTMLElement | undefined): void {
    const id = grabbedId.value;
    if (!id) {
      return;
    }
    const items = options.items();
    const from = items.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= items.length) {
      return;
    }
    options.onReorder(id, to);
    options.onSignal({ kind: "moved", id, index: to, total: items.length });
    refocus(handle);
  }

  /**
   * Park or restore the grabbed block. The block leaves this list, so the grab is released rather
   * than followed across containers — a move between zones is a complete action, not a step.
   */
  function toggleHidden(hidden: boolean): void {
    const id = grabbedId.value;
    if (!id || !options.onToggleHidden) {
      return;
    }
    options.onToggleHidden(id, hidden);
    grabbedId.value = undefined;
    options.onSignal({ kind: hidden ? "parked" : "restored", id });
  }

  function onKeydown(event: KeyboardEvent, id: string): void {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (isGrabbed(id)) {
        drop();
      } else {
        grab(id);
      }
      return;
    }

    if (!isGrabbed(id)) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }

    const horizontal = options.orientation === "horizontal";
    const handle = event.currentTarget as HTMLElement | undefined;

    if (event.key === (horizontal ? "ArrowLeft" : "ArrowUp")) {
      event.preventDefault();
      step(-1, handle);
      return;
    }

    if (event.key === (horizontal ? "ArrowRight" : "ArrowDown")) {
      event.preventDefault();
      step(1, handle);
      return;
    }

    if (horizontal && options.onToggleHidden && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      toggleHidden(event.key === "ArrowDown");
    }
  }

  function onBlur(id: string): void {
    if (!refocusing && isGrabbed(id)) {
      cancel();
    }
  }

  return { grabbedId: readonly(grabbedId), isGrabbed, onKeydown, onBlur };
}
