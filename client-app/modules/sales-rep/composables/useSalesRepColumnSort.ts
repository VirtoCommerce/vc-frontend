import { computed, toValue } from "vue";
import type { SalesRepRuleType, SalesRepSortDirectionType } from "../types";
import type { MaybeRefOrGetter, Ref } from "vue";

// Bridges header-click sorting to the backend's named sort rules ("name"[:asc|desc]); the suffix is
// sent only to reverse a rule the backend marks reversible (`supportsDirection`).

// columnId → backend sort-rule name.
export type SalesRepSortColumnMapType = Record<string, string>;

type OptionsType = {
  // The selected sort expression ("name", or "name:asc"/"name:desc"); undefined → the server default.
  sortRule: Ref<string | undefined>;
  // columnId → ruleName. Only columns whose rule the backend actually returns become sortable.
  columns: SalesRepSortColumnMapType;
  // The column that carries the indicator when nothing is selected — i.e. the column of the server's default rule.
  defaultColumn: string;
  // Sort rules exposed by the backend for this domain (from useSalesRepRules), carrying the direction metadata.
  rules: MaybeRefOrGetter<SalesRepRuleType[]>;
};

// Split "name[:dir]" into rule name + recognized direction; an unrecognized suffix yields no direction.
function parse(expr = ""): { ruleName?: string; direction?: SalesRepSortDirectionType } {
  const [ruleName, suffix] = (expr || "").split(":");
  if (!ruleName) {
    return {};
  }
  const direction = suffix?.toLowerCase();
  return {
    ruleName,
    direction: direction === "asc" || direction === "desc" ? direction : undefined,
  };
}

export function useSalesRepColumnSort(options: OptionsType) {
  const rulesByName = computed(() => new Map(toValue(options.rules).map((rule) => [rule.name, rule] as const)));

  // ruleName → columnId, to resolve which column the active rule belongs to.
  const columnByRule = computed(
    () => new Map(Object.entries(options.columns).map(([column, rule]) => [rule, column] as const)),
  );

  // A column is sortable only when the backend exposes its rule.
  function isColumnSortable(columnId: string): boolean {
    const rule = options.columns[columnId];
    return !!rule && rulesByName.value.has(rule);
  }

  // Resolves the active rule/column/direction: selected rule (or default column's) with parsed or natural direction.
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

  // Applies the clicked column's rule; info.direction is ignored since VcTable can't know a rule's
  // reversibility — direction is decided here from backend metadata.
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
