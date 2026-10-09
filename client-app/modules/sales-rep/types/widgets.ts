// Presentational model for the KPI stat cards shared by the hub dashboard and customer profile;
// only `labelKey` is localized — value/sub/delta are pre-formatted strings owned by the caller.
// Delta tone: `positive` = higher than the previous period (green), `negative` = lower (red/orange),
// `neutral` = unchanged / a plain informational count (gray).
export type StatWidgetToneType = "positive" | "negative" | "neutral";
export type StatWidgetAccentType = "primary" | "secondary" | "success" | "warning" | "info" | "neutral";

/**
 * What a card needs fetched. The statistics queries are shaped from the union over the cards the rep
 * can actually see, so a hidden card costs nothing: an unneeded slice is left out of the document
 * (`@include`), and a query no visible card needs never fires at all.
 *
 * Tokens name a card's metric, not a field, and each stands for whole aggregation buckets — the unit
 * of backend cost, one bucket being one grouped query over the orders (see the batch loader in
 * CustomerOrderStatisticsType). `week` covers the week bucket and its previous-week baseline;
 * `monthOverMonth`/`yearOverYear` cover only the baseline, the current side being `mtd`/`ytd`.
 * `averageOrderValue` is the one field-level token: it rides along in the `ytd` bucket and so costs
 * bytes rather than a query.
 */
export type StatDataNeedType =
  | "newOrders"
  | "week"
  | "mtd"
  | "monthOverMonth"
  | "ytd"
  | "yearOverYear"
  | "averageOrderValue"
  | "cartStatistics"
  | "customerCounts";
export type StatWidgetCardType = {
  key: string;
  labelKey: string;
  icon: string;
  value: string;
  // Optional to match <StatWidget>'s contract: accent/deltaTone have defaults, and
  // sub/delta/deltaIcon are v-if-guarded, so a card can omit any of them.
  accent?: StatWidgetAccentType;
  // De-emphasized unit rendered right after `value` (e.g. "items" in "34 items").
  valueSuffix?: string;
  sub?: string;
  delta?: string;
  deltaTone?: StatWidgetToneType;
  deltaIcon?: string;
  // Both per-card, because each card is fed by exactly one statistics query (VCST-5586): one query
  // failing must not blank the cards whose data arrived, and one query still being in flight must not
  // hold every card at the pending placeholder — which would also hide a sibling card's error, since
  // <StatWidget> gives loading precedence over it.
  loading?: boolean;
  failed?: boolean;
};
