// Presentational model for the KPI stat cards shared by the Sales Rep hub dashboard (VCST-5485)
// and the customer profile (VCST-5308). Figures are mock until the stats queries land; only
// `labelKey` is localized — value/sub/delta are pre-formatted strings owned by the caller.
export type StatWidgetToneType = "positive" | "negative";
export type StatWidgetAccentType = "primary" | "secondary" | "success" | "warning" | "info" | "neutral";
export type StatWidgetCardType = {
  key: string;
  labelKey: string;
  icon: string;
  accent: StatWidgetAccentType;
  value: string;
  sub: string;
  delta: string;
  deltaTone: StatWidgetToneType;
  deltaIcon: string;
};
