import { computed, toValue } from "vue";
import type { SalesRepRuleType } from "../types";
import type { MaybeRefOrGetter, Ref } from "vue";

// Bridges VcTable's header-click sorting to the sales-rep backend's *named* sort rules.
// The backend `sort` argument takes an opaque rule name (e.g. "by-units", "ytd-purchases"), not a
// column+direction pair, and each rule fixes its own order. So a header click just SELECTS the
// column's rule — there is no asc/desc toggle. VcTable still needs a defined `sort` object for a
// header to render as a clickable sort button, so we feed it a fixed-direction indicator.

// columnId → backend sort-rule name.
export type SalesRepSortColumnMapType = Record<string, string>;

type OptionsType = {
  // The selected sort-rule name (undefined → server default). The handler writes the chosen rule here.
  sortRule: Ref<string | undefined>;
  // columnId → ruleName. Only columns whose rule the backend actually returns become sortable.
  columns: SalesRepSortColumnMapType;
  // The column that carries the indicator when nothing is selected — i.e. the column of the server's default rule.
  defaultColumn: string;
  // Sort rules exposed by the backend for this domain (from useSalesRepRules).
  rules: MaybeRefOrGetter<SalesRepRuleType[]>;
};

export function useSalesRepColumnSort(options: OptionsType) {
  const availableRuleNames = computed(() => new Set(toValue(options.rules).map((rule) => rule.name)));

  // ruleName → columnId, to resolve which column the active rule belongs to.
  const columnByRule = computed(
    () => new Map(Object.entries(options.columns).map(([column, rule]) => [rule, column] as const)),
  );

  // A column is sortable only when the backend exposes its rule (mirrors the old `v-if="sortRules.length"`).
  function isColumnSortable(columnId: string): boolean {
    const rule = options.columns[columnId];
    return !!rule && availableRuleNames.value.has(rule);
  }

  // Active column = the selected rule's column, or the default when nothing is selected (or the selected
  // rule maps to no column). Direction is fixed ("desc") since the backend rule owns the ordering — the
  // sort info only drives which header shows the indicator.
  const sortInfo = computed<VcTableSortInfoType>(() => {
    const rule = options.sortRule.value;
    const column = (rule && columnByRule.value.get(rule)) || options.defaultColumn;
    return { column, direction: "desc" };
  });

  // Apply the clicked column's rule; the emitted direction is intentionally ignored.
  function applySort(info: VcTableSortInfoType): void {
    const rule = options.columns[info.column];
    if (rule) {
      options.sortRule.value = rule;
    }
  }

  return { sortInfo, isColumnSortable, applySort };
}
