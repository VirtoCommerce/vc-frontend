import { computed, ref, toValue } from "vue";
import type { ICompareTableRow } from "../types";
import type { MaybeRefOrGetter } from "vue";

/**
 * Row pinning for the compare table — "pin to top" keeps a characteristic row visible at the top
 * of the table regardless of the All/Differences filter. Purely local UI state (not persisted):
 * pins live as long as the owning component stays mounted (CompareTable stays mounted across
 * category-tab switches, so a pin survives those), and reset on a full page reload.
 *
 * @param rows  The table's current rows (e.g. `() => props.rows`) — pinned/unpinned partitions
 *              recompute automatically as this changes (a switched category can drop a pinned key).
 */
export function useCompareTableRowPins(rows: MaybeRefOrGetter<ICompareTableRow[]>) {
  const pinnedRowKeys = ref<Set<string>>(new Set());

  function togglePin(key: string) {
    const next = new Set(pinnedRowKeys.value);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    pinnedRowKeys.value = next;
  }

  function isRowPinned(key: string): boolean {
    return pinnedRowKeys.value.has(key);
  }

  // Pinned rows keep the order they were pinned in, not the table's original row order.
  const pinnedRows = computed(() => {
    const rowsByKey = new Map(toValue(rows).map((row) => [row.key, row]));
    return Array.from(pinnedRowKeys.value)
      .map((key) => rowsByKey.get(key))
      .filter((row): row is ICompareTableRow => row !== undefined);
  });

  const unpinnedRows = computed(() => toValue(rows).filter((row) => !pinnedRowKeys.value.has(row.key)));

  return {
    isRowPinned,
    togglePin,
    pinnedRows,
    unpinnedRows,
  };
}
