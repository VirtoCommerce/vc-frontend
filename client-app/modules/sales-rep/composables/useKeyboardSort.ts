import { nextTick, readonly, ref } from "vue";
import type { KeyboardSortOrientationType, KeyboardSortSignalType } from "../types/layout";

interface IUseKeyboardSortOptions {
  /** Stat rows read left-to-right; widget columns read top-to-bottom. Decides which arrows reorder. */
  orientation: KeyboardSortOrientationType;
  /** Current ids of the list being sorted, in render order. */
  items: () => string[];
  /** Move `id` to `index` within the list. */
  onReorder: (id: string, index: number) => void;
  /** Only wired for horizontal regions, where ↑/↓ are free because they do not reorder. */
  onToggleHidden?: (id: string, hidden: boolean) => void;
  /** Hidden state every block in this list already has, so ↑/↓ can ignore the direction that is a no-op. */
  hidden?: () => boolean;
  /** Emitted for every state change so the caller can localize and announce it. */
  onSignal: (signal: KeyboardSortSignalType) => void;
}

/**
 * Grab-and-move sorting: Space/Enter grabs and drops, arrows move, Escape restores, blur cancels so
 * tabbing away cannot strand a half-finished move. The prototype had no keyboard story to copy.
 */
export function useKeyboardSort(options: IUseKeyboardSortOptions) {
  const grabbedId = ref<string | undefined>();
  const originIndex = ref(-1);

  function isGrabbed(id: string): boolean {
    return grabbedId.value === id;
  }

  // Vue's `insertBefore` blurs the moved node in Chrome and WebKit, and blur cancels a grab — so an
  // unguarded move snaps straight back. Ignore that self-inflicted blur until the refocus has run.
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

  // `handle` only from Escape: putting the block back blurs it, so focus needs restoring. Blur-cancel
  // passes none — the user is tabbing away and pulling focus back would trap them.
  function cancel(handle?: HTMLElement): void {
    const id = grabbedId.value;
    if (!id) {
      return;
    }
    options.onReorder(id, originIndex.value);
    grabbedId.value = undefined;
    options.onSignal({ kind: "cancelled", id });

    if (handle) {
      refocus(handle);
    }
  }

  function step(delta: number, handle: HTMLElement | undefined): void {
    const id = grabbedId.value;
    if (!id) {
      return;
    }
    const items = options.items();
    const from = items.indexOf(id);
    const to = from + delta;
    if (from < 0) {
      return;
    }
    // Announced, so "nowhere further to go" is distinguishable from "arrows stopped working".
    if (to < 0 || to >= items.length) {
      options.onSignal({ kind: "edge", id, index: from, total: items.length });
      return;
    }
    options.onReorder(id, to);
    options.onSignal({ kind: "moved", id, index: to, total: items.length });
    refocus(handle);
  }

  /** The block leaves this list, so the grab is released rather than followed across containers. */
  function toggleHidden(hidden: boolean): void {
    const id = grabbedId.value;
    // The direction leading out of the zone the block is already in is a no-op: acting on it appends
    // the block to the end of its own half and announces a move that never happened.
    if (!id || !options.onToggleHidden || hidden === options.hidden?.()) {
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

    const horizontal = options.orientation === "horizontal";
    const handle = event.currentTarget as HTMLElement | undefined;

    if (event.key === "Escape") {
      event.preventDefault();
      cancel(handle);
      return;
    }

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

  // Let go without restoring position, for when the UI goes away rather than the user letting go.
  // Blur cannot cover it: browsers fire none when a focused element is unmounted.
  function release(): void {
    grabbedId.value = undefined;
    originIndex.value = -1;
  }

  return { grabbedId: readonly(grabbedId), isGrabbed, onKeydown, onBlur, release };
}
