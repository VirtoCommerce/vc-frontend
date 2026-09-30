import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import {
  SalesRepCustomerFilterRulesDocument,
  SalesRepCustomerSortRulesDocument,
  SalesRepOrderFilterRulesDocument,
  SalesRepOrderSortRulesDocument,
  SalesRepTaskFilterRulesDocument,
  SalesRepTaskSortRulesDocument,
  SalesRepTopSellerFilterRulesDocument,
  SalesRepTopSellerSortRulesDocument,
} from "../api/graphql/types";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type {
  SalesRepRuleDomainType,
  SalesRepRuleKindType,
  SalesRepRuleType,
  SalesRepSortDirectionType,
} from "../types";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { Ref } from "vue";

// Every discovery op returns the same { name, localizedName } shape under a domain-specific root field,
// so one composable drives all six (3 domains × filter/sort).
type RuleNodeType = {
  name: string;
  localizedName?: string | null;
  defaultDirection?: string | null;
  supportsDirection?: boolean | null;
};
type RuleQueryResultType = Record<string, Array<RuleNodeType | null> | null | undefined>;
// organizationId/period are declared only by the ops whose vocabulary is derived from records (order statuses,
// top-seller categories); the others simply ignore the extra variables.
type RuleQueryVariablesType = {
  storeId?: string;
  cultureName?: string;
  organizationId?: string;
  periodFrom?: string;
  periodTo?: string;
};
type RuleDocumentType = TypedDocumentNode<RuleQueryResultType, RuleQueryVariablesType>;
type RuleSourceType = { document: RuleDocumentType; field: string };

const asRuleDocument = (document: unknown): RuleDocumentType => document as RuleDocumentType;

// Only "asc"/"desc" are meaningful; anything else (incl. absent on filter rules) → undefined.
function normalizeDirection(direction?: string | null): SalesRepSortDirectionType | undefined {
  return direction === "asc" || direction === "desc" ? direction : undefined;
}

// Every supported domain × kind combination (each is a real list). One entry per discovery op.
const RULE_SOURCES: Record<`${SalesRepRuleDomainType}:${SalesRepRuleKindType}`, RuleSourceType> = {
  "order:filter": { document: asRuleDocument(SalesRepOrderFilterRulesDocument), field: "salesRepOrderFilterRules" },
  "customer:filter": {
    document: asRuleDocument(SalesRepCustomerFilterRulesDocument),
    field: "salesRepCustomerFilterRules",
  },
  "topSeller:filter": {
    document: asRuleDocument(SalesRepTopSellerFilterRulesDocument),
    field: "salesRepTopSellerFilterRules",
  },
  "order:sort": { document: asRuleDocument(SalesRepOrderSortRulesDocument), field: "salesRepOrderSortRules" },
  "customer:sort": { document: asRuleDocument(SalesRepCustomerSortRulesDocument), field: "salesRepCustomerSortRules" },
  "topSeller:sort": {
    document: asRuleDocument(SalesRepTopSellerSortRulesDocument),
    field: "salesRepTopSellerSortRules",
  },
  "task:filter": { document: asRuleDocument(SalesRepTaskFilterRulesDocument), field: "salesRepTaskFilterRules" },
  "task:sort": { document: asRuleDocument(SalesRepTaskSortRulesDocument), field: "salesRepTaskSortRules" },
};

/**
 * Scope for the data-derived vocabularies (order statuses, top-seller categories): they are read from the very records
 * the list will show, so every offered rule has data behind it. Pass the SAME scope the list uses; omit on surfaces
 * whose vocabulary is static (sort rules, customer segments).
 */
// Values are expanded (not MaybeRefOrGetter<… | undefined>) so the `?` isn't a redundant second "undefined"
// — Sonar S4782, same shape as useSalesRepOrders.
type RuleScopeType = {
  // One customer (the customer page); omit for all the rep's customers (the dashboard).
  organizationId?: string | Ref<string | undefined> | (() => string | undefined);
  // The selected period, mirroring the list's period filter.
  periodFrom?: string | Ref<string | undefined> | (() => string | undefined);
  periodTo?: string | Ref<string | undefined> | (() => string | undefined);
};

export function useSalesRepRules(
  domain: SalesRepRuleDomainType,
  kind: SalesRepRuleKindType,
  scope: RuleScopeType = {},
) {
  const source = RULE_SOURCES[`${domain}:${kind}`];
  const { t, te } = useI18n();

  const { result, loading, error, onError } = useSalesRepHubQuery(
    source.document,
    () => ({
      storeId: globals.storeId,
      cultureName: globals.cultureName,
      organizationId: toValue(scope.organizationId),
      periodFrom: toValue(scope.periodFrom),
      periodTo: toValue(scope.periodTo),
    }),
    { fetchPolicy: "cache-first" },
  );

  onError((queryError) => {
    // Keep the control functional (renders empty); no toasts by design — the surface says so inline.
    Logger.error(`[sales-rep] ${domain}:${kind} rules failed:`, queryError);
  });

  const rules = computed<SalesRepRuleType[]>(() =>
    (result.value?.[source.field] ?? [])
      .filter((rule): rule is RuleNodeType => rule != null)
      .map((rule) => ({
        name: rule.name,
        label: resolveLabel(rule.name, rule.localizedName),
        // Sort-only metadata (undefined on filter rules); normalize the direction to the "asc"/"desc" union.
        defaultDirection: normalizeDirection(rule.defaultDirection),
        supportsDirection: rule.supportsDirection ?? undefined,
      })),
  );

  // Label priority: frontend i18n (by rule name) → backend localizedName → raw name.
  function resolveLabel(name: string, localizedName?: string | null): string {
    const key = `sales_rep.rules.${domain}.${kind}.${name}`;
    return te(key) ? t(key) : localizedName || name;
  }

  // An empty catalog and a failed read look identical in `rules`, so the surface needs this to say which.
  const failed = computed(() => Boolean(error.value));

  return { rules, loading, failed };
}
