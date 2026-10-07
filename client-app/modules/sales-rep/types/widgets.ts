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
