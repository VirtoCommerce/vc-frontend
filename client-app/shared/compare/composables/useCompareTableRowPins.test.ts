import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useCompareTableRowPins } from "./useCompareTableRowPins";
import type { ICompareTableRow } from "../types";

function row(key: string, overrides: Partial<ICompareTableRow> = {}): ICompareTableRow {
  return { key, label: key, kind: "text", values: [], differs: false, ...overrides };
}

describe("useCompareTableRowPins", () => {
  it("starts with nothing pinned", () => {
    const { isRowPinned, pinnedRows, unpinnedRows } = useCompareTableRowPins(() => [row("price"), row("sku")]);

    expect(isRowPinned("price")).toBe(false);
    expect(pinnedRows.value).toEqual([]);
    expect(unpinnedRows.value.map((r) => r.key)).toEqual(["price", "sku"]);
  });

  it("togglePin pins and unpins a row", () => {
    const { isRowPinned, togglePin, pinnedRows, unpinnedRows } = useCompareTableRowPins(() => [
      row("price"),
      row("sku"),
    ]);

    togglePin("price");
    expect(isRowPinned("price")).toBe(true);
    expect(pinnedRows.value.map((r) => r.key)).toEqual(["price"]);
    expect(unpinnedRows.value.map((r) => r.key)).toEqual(["sku"]);

    togglePin("price");
    expect(isRowPinned("price")).toBe(false);
    expect(pinnedRows.value).toEqual([]);
    expect(unpinnedRows.value.map((r) => r.key)).toEqual(["price", "sku"]);
  });

  it("pinnedRows keeps the order rows were pinned in, not the table's row order", () => {
    const { togglePin, pinnedRows } = useCompareTableRowPins(() => [row("price"), row("sku"), row("availability")]);

    togglePin("sku");
    togglePin("price");

    expect(pinnedRows.value.map((r) => r.key)).toEqual(["sku", "price"]);
  });

  it("recomputes pinned/unpinned as the underlying rows change (e.g. a category switch)", () => {
    const rows = ref<ICompareTableRow[]>([row("price"), row("sku")]);
    const { togglePin, pinnedRows, unpinnedRows } = useCompareTableRowPins(rows);

    togglePin("sku");
    expect(pinnedRows.value.map((r) => r.key)).toEqual(["sku"]);

    // Switching category drops "sku" from the row set entirely — its pin key survives in state,
    // but it should silently disappear from pinnedRows rather than error or resurrect a stale row.
    rows.value = [row("price"), row("availability")];

    expect(pinnedRows.value).toEqual([]);
    expect(unpinnedRows.value.map((r) => r.key)).toEqual(["price", "availability"]);
  });

  it("re-pins correctly if a matching key reappears after the underlying rows change", () => {
    const rows = ref<ICompareTableRow[]>([row("price"), row("sku")]);
    const { togglePin, pinnedRows } = useCompareTableRowPins(rows);

    togglePin("sku");
    rows.value = [row("price")];
    expect(pinnedRows.value).toEqual([]);

    rows.value = [row("price"), row("sku")];
    expect(pinnedRows.value.map((r) => r.key)).toEqual(["sku"]);
  });
});
