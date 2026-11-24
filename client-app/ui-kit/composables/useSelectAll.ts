import { differenceWith, unionWith } from "lodash-es";
import { computed, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

export interface IUseSelectAllOptions<T> {
  /** The options on screen, in render order: each one's item and whether it is selected. */
  rows: MaybeRefOrGetter<readonly { item: T; active: boolean }[]>;
  /** The whole selection, including items no option on screen holds. */
  selectedItems: MaybeRefOrGetter<readonly T[]>;
  /** Whether two items are one, whatever object holds each: a page or a query refetched returns new objects. */
  isSameItem: (left: T, right: T) => boolean;
  /** Without `serverFilter`, the typed query narrowing the options. */
  filterValue: MaybeRefOrGetter<string>;
  /** With `serverFilter`, the query the options and `total` on screen answer, as the consumer echoes it. */
  answeredQuery: MaybeRefOrGetter<string>;
  /** The consumer filters the options (server-side), so `total` counts the query's matches. */
  serverFilter: MaybeRefOrGetter<boolean | undefined>;
  /** The typed query is not sent yet, or the consumer has not echoed it (spaces aside). */
  answerPending: MaybeRefOrGetter<boolean>;
  /** The size of the whole set; defaults to the number of options on screen. */
  total: MaybeRefOrGetter<number | undefined>;
  /**
   * Bound at all, it says the consumer completes the set: without it a paged row cannot tell a fully
   * selected page from the whole selection. Its value counts under a server-side query: the selected
   * matches among `total`, the ones not loaded included.
   */
  selectedCount: MaybeRefOrGetter<number | undefined>;
}

/** A consumer's `selected-count` that counts: a finite number. Anything else leaves the set uncounted. */
export function isSelectedCountKnown(count: number | undefined): count is number {
  return count !== undefined && Number.isFinite(count);
}

/**
 * The Select all row of a multiple select: its `selected of total` counter, its checked and
 * indeterminate states, and the selection a press produces.
 */
export function useSelectAll<T>(params: IUseSelectAllOptions<T>) {
  // While a query narrows the list, only the matching options count: a local filter is unknown to
  // `total`, and with `serverFilter` the consumer's `total` counts the matches of the answered query.
  const isNarrowed = computed(
    () => !!(toValue(params.serverFilter) ? toValue(params.answeredQuery) : toValue(params.filterValue)),
  );

  const optionCount = computed(() => toValue(params.rows).length);

  const selectedVisibleCount = computed(() => toValue(params.rows).filter((row) => row.active).length);

  const totalCount = computed(() =>
    isNarrowed.value && !toValue(params.serverFilter)
      ? optionCount.value
      : (toValue(params.total) ?? optionCount.value),
  );

  const knownSelectedCount = computed(() => {
    const count = toValue(params.selectedCount);

    return isSelectedCountKnown(count) ? count : undefined;
  });

  // Never below what is visibly selected. Without `total` nothing beyond the loaded options can be
  // counted; with it, model items past it are ones no option holds.
  const selectedCount = computed(() => {
    const total = toValue(params.total);

    if (!isNarrowed.value) {
      return total === undefined
        ? selectedVisibleCount.value
        : Math.max(Math.min(toValue(params.selectedItems).length, total), selectedVisibleCount.value);
    }

    if (!toValue(params.serverFilter) || knownSelectedCount.value === undefined) {
      return selectedVisibleCount.value;
    }

    return Math.max(Math.min(knownSelectedCount.value, totalCount.value), selectedVisibleCount.value);
  });

  const isEveryOptionSelected = computed(
    () => optionCount.value > 0 && selectedVisibleCount.value === optionCount.value,
  );

  // A partial row whose options are all selected means "select the rest" only when the consumer counts
  // the set. Otherwise it may be the whole selection, so it shows checked and a press clears: the row
  // never gets stuck on a selection nothing would complete.
  const isCounted = computed(() => knownSelectedCount.value !== undefined);

  // Checked means `n of n`, or a fully selected page of a set the consumer does not count.
  const isAllSelected = computed(
    () => isEveryOptionSelected.value && (selectedCount.value >= totalCount.value || !isCounted.value),
  );

  const isSomeSelected = computed(() => selectedCount.value > 0 && !isAllSelected.value);

  // Under `server-filter`, a typed query not sent or not echoed yet would have a press misreport it;
  // with no option on screen there is nothing to do.
  const isDisabled = computed(() => toValue(params.answerPending) || !optionCount.value);

  /**
   * The selection a press produces, and whether it selected (`select-all`) or cleared (`deselect-all`);
   * check `isDisabled` first. The press follows the row's state: checked clears, unchecked and mixed
   * select — on a counted partial set whose loaded options are all selected that adds nothing here,
   * and the consumer selects the rest on `select-all`.
   */
  function toggle(): { items: T[]; action: VcSelectSelectAllPayloadType["action"] } {
    const selectedItems = toValue(params.selectedItems);
    const items = toValue(params.rows).map((row) => row.item);

    if (isAllSelected.value) {
      // What a query hides stays selected; unnarrowed, the whole selection goes, loaded or not.
      return {
        items: isNarrowed.value ? differenceWith(selectedItems, items, params.isSameItem) : [],
        action: "deselect-all",
      };
    }

    return { items: unionWith(selectedItems, items, params.isSameItem), action: "select-all" };
  }

  return {
    totalCount,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isDisabled,
    toggle,
  };
}
