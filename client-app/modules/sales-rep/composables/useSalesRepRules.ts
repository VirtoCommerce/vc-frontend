import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import {
  SalesRepCustomerFilterRulesDocument,
  SalesRepCustomerSortRulesDocument,
  SalesRepOrderFilterRulesDocument,
  SalesRepOrderSortRulesDocument,
  SalesRepTopSellerFilterRulesDocument,
  SalesRepTopSellerSortRulesDocument,
} from "../api/graphql/types";
import type {
  SalesRepRuleDomainType,
  SalesRepRuleKindType,
  SalesRepRuleType,
  SalesRepSortDirectionType,
} from "../types";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// Every discovery op returns the same { name, localizedName } shape under a domain-specific root field,
// so one composable drives all six (3 domains × filter/sort).
type RuleNodeType = {
  name: string;
  localizedName?: string | null;
  defaultDirection?: string | null;
  supportsDirection?: boolean | null;
};
type RuleQueryResultType = Record<string, Array<RuleNodeType | null> | null | undefined>;
type RuleQueryVariablesType = { storeId?: string; cultureName?: string };
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
};

export function useSalesRepRules(domain: SalesRepRuleDomainType, kind: SalesRepRuleKindType) {
  const source = RULE_SOURCES[`${domain}:${kind}`];
  const { t, te } = useI18n();

  const { result, loading, onError } = useQuery(
    source.document,
    () => ({ storeId: globals.storeId, cultureName: globals.cultureName }),
    { fetchPolicy: "cache-first", context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT },
  );

  onError((error) => {
    // Keep the control functional (renders empty); no toasts by design.
    Logger.error(`[sales-rep] ${domain}:${kind} rules failed:`, error);
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

  return { rules, loading };
}
