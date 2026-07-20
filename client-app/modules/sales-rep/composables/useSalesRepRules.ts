import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import {
  SalesRepCartFilterRulesDocument,
  SalesRepCustomerFilterRulesDocument,
  SalesRepCustomerSortRulesDocument,
  SalesRepOrderFilterRulesDocument,
  SalesRepOrderSortRulesDocument,
  SalesRepTopSellerFilterRulesDocument,
  SalesRepTopSellerSortRulesDocument,
} from "../api/graphql/types";
import type { SalesRepRuleDomainType, SalesRepRuleKindType, SalesRepRuleType } from "../types";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

// CONTROLS source: every discovery op returns the same { name, localizedName } list under a
// domain-specific root field, so one composable drives all seven. Each generated document is cast to
// this shared shape and paired with its root field name.
type RuleNodeType = { name: string; localizedName?: string | null };
type RuleQueryResultType = Record<string, Array<RuleNodeType | null> | null | undefined>;
type RuleQueryVariablesType = { storeId?: string; cultureName?: string };
type RuleDocumentType = TypedDocumentNode<RuleQueryResultType, RuleQueryVariablesType>;
type RuleSourceType = { document: RuleDocumentType; field: string };

const asRuleDocument = (document: unknown): RuleDocumentType => document as RuleDocumentType;

// All domain × kind combinations. Carts are not a list, so there is no cart sort axis (undefined).
const RULE_SOURCES: Record<`${SalesRepRuleDomainType}:${SalesRepRuleKindType}`, RuleSourceType | undefined> = {
  "order:filter": { document: asRuleDocument(SalesRepOrderFilterRulesDocument), field: "salesRepOrderFilterRules" },
  "cart:filter": { document: asRuleDocument(SalesRepCartFilterRulesDocument), field: "salesRepCartFilterRules" },
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
  "cart:sort": undefined,
};

export function useSalesRepRules(domain: SalesRepRuleDomainType, kind: SalesRepRuleKindType) {
  const source = RULE_SOURCES[`${domain}:${kind}`];
  const { t, te } = useI18n();
  // useQuery must run unconditionally (composable rule); use any document as a placeholder but disable
  // the request for an unsupported axis so it never fires.
  const document = source?.document ?? asRuleDocument(SalesRepOrderFilterRulesDocument);

  const { result, loading, onError } = useQuery(
    document,
    () => ({ storeId: globals.storeId, cultureName: globals.cultureName }),
    { fetchPolicy: "cache-first", enabled: source != null },
  );

  onError((error) => {
    // Keep the control functional (renders empty); no toasts by design.
    Logger.error(`[sales-rep] ${domain}:${kind} rules failed:`, error);
  });

  const rules = computed<SalesRepRuleType[]>(() => {
    if (!source) {
      return [];
    }
    return (result.value?.[source.field] ?? [])
      .filter((rule): rule is RuleNodeType => rule != null)
      .map((rule) => ({ name: rule.name, label: resolveLabel(rule.name, rule.localizedName) }));
  });

  // Display label priority: frontend i18n keyed by the rule name → backend localizedName → raw name.
  // Lets the storefront localize/override known rule names while custom/backend rules keep their server label.
  function resolveLabel(name: string, localizedName?: string | null): string {
    const key = `sales_rep.rules.${domain}.${kind}.${name}`;
    return te(key) ? t(key) : localizedName || name;
  }

  return { rules, loading };
}
