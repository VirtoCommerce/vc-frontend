import { useEventListener } from "@vueuse/core";
import { computed, nextTick, ref, watch } from "vue";
import type { Ref } from "vue";

type ParamsType<T> = {
  /** Prefix for generated option ids; pass a component id so ids stay unique on the page. */
  componentId: string;
  /** The options currently rendered, in render order. */
  items: Ref<readonly T[]>;
  /** Identity of an option. Defaults to the item itself; pass one when the list is rebuilt. */
  getKey?: (item: T) => unknown;
  /** The listbox element; when given, a pointer highlight is dropped as the pointer leaves it. */
  list?: Readonly<Ref<HTMLElement | null>>;
};

export type ListboxNavigationKeyType = "up" | "down" | "home" | "end";

// The listbox itself, or the scroll region wrapping it; never the page.
function getScrollBox(list: HTMLElement): HTMLElement {
  let node: HTMLElement | null = list;

  while (node && node !== document.body) {
    if (node.scrollHeight > node.clientHeight) {
      return node;
    }

    node = node.parentElement;
  }

  return list;
}

/**
 * Keyboard state for a listbox driven by `aria-activedescendant`: DOM focus stays on the combobox
 * or search field, and the active option is published by id and styled with a `highlighted` flag.
 * Bind VcMenuItem's `highlight-ring` to `!isPassiveHighlight` so only a keyboard position rings.
 */
export function useListboxNavigation<T>(params: ParamsType<T>) {
  const highlightedIndex = ref(-1);
  const count = computed(() => params.items.value.length);

  // A highlight the pointer put there is not a keyboard position: it keeps its background but
  // draws no ring until the keyboard moves it. Any other change of index makes it a keyboard position.
  const isPassiveHighlight = ref(false);

  watch(highlightedIndex, () => (isPassiveHighlight.value = false), { flush: "sync" });

  function highlight(index: number): void {
    highlightedIndex.value = index;
    isPassiveHighlight.value = false;
  }

  function highlightPassively(index: number): void {
    highlightedIndex.value = index;
    isPassiveHighlight.value = true;
  }

  // A pointer highlight ends with the pointer; left in place it would look like a selection.
  function dropPassiveHighlight(): void {
    if (isPassiveHighlight.value) {
      reset();
    }
  }

  if (params.list) {
    useEventListener(params.list, "mouseleave", dropPassiveHighlight);
  }

  function getItemKey(item: T): unknown {
    return params.getKey ? params.getKey(item) : item;
  }

  function getOptionId(index: number): string {
    return `${params.componentId}-option-${index}`;
  }

  const activeDescendantId = computed(() =>
    highlightedIndex.value >= 0 ? getOptionId(highlightedIndex.value) : undefined,
  );

  function move(delta: number): void {
    if (!count.value) {
      return;
    }

    const current = highlightedIndex.value;

    if (current < 0) {
      highlightedIndex.value = delta > 0 ? 0 : count.value - 1;
      return;
    }

    highlightedIndex.value = (current + delta + count.value) % count.value;
  }

  function navigate(key: ListboxNavigationKeyType): void {
    isPassiveHighlight.value = false;

    // Index 0 of an empty list would point `aria-activedescendant` at nothing.
    if (!count.value) {
      return;
    }

    if (key === "home") {
      highlightedIndex.value = 0;
    } else if (key === "end") {
      highlightedIndex.value = count.value - 1;
    } else {
      move(key === "down" ? 1 : -1);
    }
  }

  function reset(): void {
    highlight(-1);
  }

  // Not `scrollIntoView`, which also scrolls the page.
  function scrollHighlightedIntoView(index: number): void {
    const option = document.getElementById(getOptionId(index));
    const list = option?.closest<HTMLElement>('[role="listbox"]');

    if (!option || !list) {
      return;
    }

    const scrollBox = getScrollBox(list);
    const optionBox = option.getBoundingClientRect();
    const viewport = scrollBox.getBoundingClientRect();

    if (optionBox.top < viewport.top) {
      scrollBox.scrollTop -= viewport.top - optionBox.top;
    } else if (optionBox.bottom > viewport.bottom) {
      scrollBox.scrollTop += optionBox.bottom - viewport.bottom;
    }
  }

  // Paging appends, so the highlight survives; a rebuilt list puts another option under it.
  watch(params.items, (items, previous) => {
    const index = highlightedIndex.value;

    if (index < 0) {
      return;
    }

    // By length, not truthiness: an option may be `0`, `""` or `false`. Past either end there is no
    // option for `getKey` to read.
    if (index >= previous.length || index >= items.length) {
      reset();
      return;
    }

    if (getItemKey(items[index]) !== getItemKey(previous[index])) {
      reset();
    }
  });

  // Only the keyboard scrolls: a row under a still pointer that scrolled would hand the pointer the
  // next row, which would highlight and scroll in turn. The flag is watched too, so a key that keeps
  // a pointer-highlighted row (End on the last one) still brings it into view.
  watch([highlightedIndex, isPassiveHighlight], ([index, passive]) => {
    if (index < 0 || passive) {
      return;
    }

    void nextTick(() => scrollHighlightedIntoView(index));
  });

  return {
    highlightedIndex,
    activeDescendantId,
    getOptionId,
    navigate,
    highlight,
    highlightPassively,
    isPassiveHighlight,
    reset,
  };
}
