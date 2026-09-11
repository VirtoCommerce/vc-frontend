import { computed, nextTick, ref, watch } from "vue";
import type { Ref } from "vue";

type ParamsType<T> = {
  /** Prefix for generated option ids; pass a component id so ids stay unique on the page. */
  componentId: string;
  /** The options currently rendered, in render order. */
  items: Ref<readonly T[]>;
  /** Identity of an option. Defaults to the item itself; pass one when the list is rebuilt. */
  getKey?: (item: T) => unknown;
};

export type ListboxNavigationKeyType = "up" | "down" | "home" | "end";

/**
 * Keyboard state for a listbox driven by `aria-activedescendant`.
 *
 * DOM focus stays on the combobox or search field; the active option is published through
 * `aria-activedescendant` and styled with a `highlighted` flag. Moving real focus onto options
 * instead — as both listboxes in this repo used to do — makes typing impossible in a search
 * field and ties navigation to DOM order.
 */
export function useListboxNavigation<T>(params: ParamsType<T>) {
  const highlightedIndex = ref(-1);
  const count = computed(() => params.items.value.length);

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
    if (key === "home") {
      highlightedIndex.value = 0;
    } else if (key === "end") {
      highlightedIndex.value = count.value - 1;
    } else {
      move(key === "down" ? 1 : -1);
    }
  }

  function reset(): void {
    highlightedIndex.value = -1;
  }

  /**
   * Deliberately not `scrollIntoView`: that scrolls every scrollable ancestor, so opening a
   * list low on the page yanks the whole page. This adjusts only the list's own scrollTop.
   */
  function scrollHighlightedIntoView(index: number): void {
    const option = document.getElementById(getOptionId(index));
    const list = option?.closest<HTMLElement>('[role="listbox"]');

    if (!option || !list) {
      return;
    }

    const optionBox = option.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();

    if (optionBox.top < listBox.top) {
      list.scrollTop -= listBox.top - optionBox.top;
    } else if (optionBox.bottom > listBox.bottom) {
      list.scrollTop += optionBox.bottom - listBox.bottom;
    }
  }

  /**
   * Paging appends to the list, so the highlighted option is still where it was — dropping the
   * highlight there would throw the user back to the top mid-navigation. A rebuilt list (a new
   * search) puts a different option under the index, and then the highlight has to go.
   */
  watch(params.items, (items, previous) => {
    const index = highlightedIndex.value;

    if (index < 0) {
      return;
    }

    const before = previous?.[index];

    if (!before || index >= items.length || getItemKey(items[index]) !== getItemKey(before)) {
      reset();
    }
  });

  watch(highlightedIndex, (index) => {
    if (index < 0) {
      return;
    }

    void nextTick(() => scrollHighlightedIntoView(index));
  });

  return {
    highlightedIndex,
    activeDescendantId,
    getOptionId,
    navigate,
    move,
    reset,
  };
}
