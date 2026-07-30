// Presentational model for the KPI stat cards shared by the hub dashboard and customer profile;
// only `labelKey` is localized — value/sub/delta are pre-formatted strings owned by the caller.
// Delta tone: `positive` = higher than the previous period (green), `negative` = lower (red/orange),
// `neutral` = unchanged / a plain informational count (gray).
export type StatWidgetToneType = "positive" | "negative" | "neutral";
export type StatWidgetAccentType = "primary" | "secondary" | "success" | "warning" | "info" | "neutral";
export type StatWidgetCardType = {
  key: string;
  labelKey: string;
  icon: string;
  value: string;
  // Optional to match <StatWidget>'s contract: accent/deltaTone have defaults, and
  // sub/delta/deltaIcon are v-if-guarded, so a card can omit any of them.
  accent?: StatWidgetAccentType;
  sub?: string;
  delta?: string;
  deltaTone?: StatWidgetToneType;
  deltaIcon?: string;
  // Per-card, because each card is fed by exactly one statistics query: a failure must not blank the
  // cards whose own data arrived fine (VCST-5586).
  failed?: boolean;
};
