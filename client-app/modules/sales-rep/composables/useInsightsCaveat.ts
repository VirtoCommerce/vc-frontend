import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import type { ComputedRef, Ref } from "vue";

/**
 * The footer line under both insights panels: GA sees a subset of real activity, so a list without it reads as a
 * complete record. `dataAsOf` names how stale the data may be.
 */
export function useInsightsCaveat(dataAsOf: Ref<string | undefined> | (() => string | undefined)): ComputedRef<string> {
  const { t, d } = useI18n();

  return computed(() => {
    const parts = [t("sales_rep.customer_insights.tracked_caveat")];
    const date = toValue(dataAsOf);
    if (date) {
      parts.push(t("sales_rep.customer_insights.data_as_of", { date: d(new Date(date), "short") }));
    }
    return parts.join(" · ");
  });
}
