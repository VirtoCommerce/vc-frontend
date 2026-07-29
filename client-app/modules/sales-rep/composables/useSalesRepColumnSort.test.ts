import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useSalesRepColumnSort } from "./useSalesRepColumnSort";
import type { SalesRepRuleType } from "../types";
import type { Ref } from "vue";

// Mirrors the orders widget wiring: "date" → the one-way "recent" rule, "total" → the reversible "total" rule.
const RULES: SalesRepRuleType[] = [
  { name: "recent", label: "Recent", defaultDirection: "desc", supportsDirection: false },
  { name: "total", label: "Total", defaultDirection: "desc", supportsDirection: true },
];

function setup(options?: { sortRule?: string; rules?: SalesRepRuleType[] }) {
  const sortRule: Ref<string | undefined> = ref(options?.sortRule);
  const composable = useSalesRepColumnSort({
    sortRule,
    columns: { date: "recent", total: "total" },
    defaultColumn: "date",
    rules: options?.rules ?? RULES,
  });
  return { sortRule, ...composable };
}

describe("useSalesRepColumnSort", () => {
  describe("isColumnSortable", () => {
    it("is true only for columns whose rule the backend exposes", () => {
      const { isColumnSortable } = setup();
      expect(isColumnSortable("date")).toBe(true);
      expect(isColumnSortable("total")).toBe(true);
    });

    it("is false for a column with no mapped rule", () => {
      const { isColumnSortable } = setup();
      expect(isColumnSortable("status")).toBe(false);
    });

    it("is false when the mapped rule is absent from the backend rule set", () => {
      const { isColumnSortable } = setup({ rules: [RULES[0]] });
      expect(isColumnSortable("total")).toBe(false);
    });
  });

  describe("sortInfo", () => {
    it("defaults to the default column at its rule's natural direction when nothing is selected", () => {
      const { sortInfo } = setup();
      expect(sortInfo.value).toEqual({ column: "date", direction: "desc" });
    });

    it("reflects the selected rule and its natural direction", () => {
      const { sortInfo } = setup({ sortRule: "total" });
      expect(sortInfo.value).toEqual({ column: "total", direction: "desc" });
    });

    it("honors an explicit direction suffix", () => {
      const { sortInfo } = setup({ sortRule: "total:asc" });
      expect(sortInfo.value).toEqual({ column: "total", direction: "asc" });
    });

    it("lowercases the direction suffix", () => {
      const { sortInfo } = setup({ sortRule: "total:ASC" });
      expect(sortInfo.value.direction).toBe("asc");
    });

    it("ignores an unrecognized direction suffix, falling back to the rule's default", () => {
      const { sortInfo } = setup({ sortRule: "total:sideways" });
      expect(sortInfo.value).toEqual({ column: "total", direction: "desc" });
    });

    it("falls back to the default column when the selected rule is unknown", () => {
      const { sortInfo } = setup({ sortRule: "bogus" });
      expect(sortInfo.value).toEqual({ column: "date", direction: "desc" });
    });
  });

  describe("applySort", () => {
    it("switches columns at the target rule's natural direction (bare rule name)", () => {
      const { sortRule, applySort } = setup();
      // Active column is "date"; the incoming info.direction is intentionally ignored.
      applySort({ column: "total", direction: "asc" });
      expect(sortRule.value).toBe("total");
    });

    it("toggles direction on the same column when the rule is reversible", () => {
      const { sortRule, applySort } = setup({ sortRule: "total" });
      applySort({ column: "total", direction: "desc" });
      // desc → asc; asc differs from the natural "desc", so the suffix is emitted.
      expect(sortRule.value).toBe("total:asc");

      applySort({ column: "total", direction: "asc" });
      // asc → desc; back to natural direction, so the suffix is dropped.
      expect(sortRule.value).toBe("total");
    });

    it("is a no-op when re-clicking a non-reversible column", () => {
      const { sortRule, applySort } = setup();
      // "date" maps to "recent" (supportsDirection: false); it is already the active column.
      applySort({ column: "date", direction: "asc" });
      expect(sortRule.value).toBeUndefined();
    });

    it("is a no-op for a column with no mapped rule", () => {
      const { sortRule, applySort } = setup({ sortRule: "total" });
      applySort({ column: "status", direction: "asc" });
      expect(sortRule.value).toBe("total");
    });

    it("is a no-op when the mapped rule is absent from the backend rule set", () => {
      const { sortRule, applySort } = setup({ sortRule: "recent", rules: [RULES[0]] });
      // Only "recent" is exposed, so clicking the "total" column can't resolve a rule.
      applySort({ column: "total", direction: "asc" });
      expect(sortRule.value).toBe("recent");
    });
  });
});
