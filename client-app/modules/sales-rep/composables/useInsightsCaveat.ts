import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import type { ComputedRef, Ref } from "vue";

/**
 * The footer line both insights widgets render under their lists. GA sees a subset of real activity
 * (ad blockers, consent mode, the development guard), so a list without this caveat reads as a
 * complete record — the wording is part of the design, not decoration (design doc §4.7). `dataAsOf`
 * names how stale the data may be: GA processing lags by up to 24–48h.
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
