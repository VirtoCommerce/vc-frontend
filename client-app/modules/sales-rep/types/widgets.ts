// Presentational model for the KPI stat cards shared by the Sales Rep hub dashboard (VCST-5485)
// and the customer profile (VCST-5308). Only `labelKey` is localized — value/sub/delta are
// pre-formatted strings owned by the caller.
// Delta tone: `positive` = higher than the previous period (green), `negative` = lower (red/orange),
// `neutral` = unchanged / a plain informational count (gray).
export type StatWidgetToneType = "positive" | "negative" | "neutral";
export type StatWidgetAccentType = "primary" | "secondary" | "success" | "warning" | "info" | "neutral";
export type StatWidgetCardType = {
  key: string;
  labelKey: string;
  icon: string;
  accent: StatWidgetAccentType;
  value: string;
  // Optional — not every KPI has a sub-line or a period-over-period delta (the component v-ifs them).
  sub?: string;
  delta?: string;
  deltaTone?: StatWidgetToneType;
  deltaIcon?: string;
};
