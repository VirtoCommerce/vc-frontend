import { computed, nextTick, ref, watch } from "vue";
import type { Ref } from "vue";

type ParamsType = {
  /** Prefix for generated option ids; pass a component id so ids stay unique on the page. */
  componentId: string;
  /** How many options are currently rendered. */
  count: Ref<number>;
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
export function useListboxNavigation(params: ParamsType) {
  const highlightedIndex = ref(-1);

  function getOptionId(index: number): string {
    return `${params.componentId}-option-${index}`;
  }

  const activeDescendantId = computed(() =>
    highlightedIndex.value >= 0 ? getOptionId(highlightedIndex.value) : undefined,
  );

  function move(delta: number): void {
    const count = params.count.value;

    if (!count) {
      return;
    }

    const current = highlightedIndex.value;

    if (current < 0) {
      highlightedIndex.value = delta > 0 ? 0 : count - 1;
      return;
    }

    highlightedIndex.value = (current + delta + count) % count;
  }

  function navigate(key: ListboxNavigationKeyType): void {
    if (key === "home") {
      highlightedIndex.value = 0;
    } else if (key === "end") {
      highlightedIndex.value = params.count.value - 1;
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
