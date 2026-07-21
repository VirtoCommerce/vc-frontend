import { computed, toValue } from "vue";
import type { SalesRepRuleType, SalesRepSortDirectionType } from "../types";
import type { MaybeRefOrGetter, Ref } from "vue";

// Bridges VcTable's header-click sorting to the sales-rep backend's *named* sort rules.
// The backend `sort` argument is a rule name (e.g. "ytd-purchases") with an optional X-Order-style
// ":asc"/":desc" suffix. A header click selects the column's rule; clicking the already-active column
// toggles its direction — but only for rules the backend marks reversible (`supportsDirection`). One-way
// rules (e.g. orders "recent", top-sellers "by-units") stay fixed. We send the bare name for a rule's
// natural direction (always accepted) and append the suffix only to reverse it, so an unsupported
// direction is never sent (the backend rejects those).

// columnId → backend sort-rule name.
export type SalesRepSortColumnMapType = Record<string, string>;

type OptionsType = {
  // The selected sort expression ("name", or "name:asc"/"name:desc"); undefined → the server default.
  // The handler forwards this straight to the query's `sort` argument.
  sortRule: Ref<string | undefined>;
  // columnId → ruleName. Only columns whose rule the backend actually returns become sortable.
  columns: SalesRepSortColumnMapType;
  // The column that carries the indicator when nothing is selected — i.e. the column of the server's default rule.
  defaultColumn: string;
  // Sort rules exposed by the backend for this domain (from useSalesRepRules), carrying the direction metadata.
  rules: MaybeRefOrGetter<SalesRepRuleType[]>;
};

export function useSalesRepColumnSort(options: OptionsType) {
  const rulesByName = computed(() => new Map(toValue(options.rules).map((rule) => [rule.name, rule] as const)));

  // ruleName → columnId, to resolve which column the active rule belongs to.
  const columnByRule = computed(
    () => new Map(Object.entries(options.columns).map(([column, rule]) => [rule, column] as const)),
  );

  // A column is sortable only when the backend exposes its rule (mirrors the old `v-if="sortRules.length"`).
  function isColumnSortable(columnId: string): boolean {
    const rule = options.columns[columnId];
    return !!rule && rulesByName.value.has(rule);
  }

  // Split "name[:dir]" into the rule name and (recognized) direction. Rule names contain no colon; a garbage
  // suffix yields no direction (the rule's natural one then applies), mirroring the backend's own parsing.
  function parse(expr: string | undefined): { ruleName?: string; direction?: SalesRepSortDirectionType } {
    const value = expr ?? "";
    if (!value) {
      return {};
    }
    const separator = value.indexOf(":");
    if (separator === -1) {
      return { ruleName: value };
    }
    const suffix = value.slice(separator + 1).toLowerCase();
    return {
      ruleName: value.slice(0, separator),
      direction: suffix === "asc" || suffix === "desc" ? suffix : undefined,
    };
  }

  // The rule/column/direction currently in effect: the selected rule (or the default column's rule when nothing
  // is selected or the selection is unknown), with the parsed direction or the rule's natural default.
  const active = computed(() => {
    const parsed = parse(options.sortRule.value);
    const rule =
      (parsed.ruleName ? rulesByName.value.get(parsed.ruleName) : undefined) ??
      rulesByName.value.get(options.columns[options.defaultColumn]);
    const column = (rule && columnByRule.value.get(rule.name)) || options.defaultColumn;
    const direction: SalesRepSortDirectionType = parsed.direction ?? rule?.defaultDirection ?? "desc";
    return { column, direction };
  });

  const sortInfo = computed<VcTableSortInfoType>(() => ({
    column: active.value.column,
    direction: active.value.direction,
  }));

  // Apply the clicked column's rule. Clicking the active column toggles direction (reversible rules only);
  // clicking another column selects its rule at its natural direction. The emitted `info.direction` is ignored:
  // VcTable can't know a rule's reversibility, so the direction is decided here from the backend metadata.
  function applySort(info: VcTableSortInfoType): void {
    const ruleName = options.columns[info.column];
    const rule = ruleName ? rulesByName.value.get(ruleName) : undefined;
    if (!rule) {
      return;
    }

    const defaultDirection = rule.defaultDirection ?? "desc";

    let direction: SalesRepSortDirectionType;
    if (info.column === active.value.column) {
      // Same column: reverse it — but only when the rule allows the opposite direction.
      if (!rule.supportsDirection) {
        return;
      }
      direction = active.value.direction === "asc" ? "desc" : "asc";
    } else {
      // Switching columns: start at the rule's natural direction.
      direction = defaultDirection;
    }

    // Bare name for the natural direction (always accepted); the suffix only to reverse (reachable for reversible rules).
    options.sortRule.value = direction === defaultDirection ? rule.name : `${rule.name}:${direction}`;
  }

  return { sortInfo, isColumnSortable, applySort };
}
