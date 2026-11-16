type ChartColorShadeType = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/** A palette step, e.g. `"primary-500"`; follows the theme preset and dark mode. */
export type ChartColorType = `${VcMainColorType}-${ChartColorShadeType}`;

export type ChartCategoryType = {
  id: string;
  label: string;
  /** Shown instead of `label` once the columns get narrow. */
  shortLabel?: string;
  /** No data yet: a dashed stub with the `#placeholder` slot as its caption; series values here are not drawn. */
  placeholder?: boolean;
};

type ChartSeriesBaseType = {
  id: string;
  /** The legend text. */
  name: string;
  /** One value per category, by index; `null` draws nothing there. */
  data: (number | null)[];
  /** Default `"primary-500"`. */
  color?: ChartColorType;
  hidden?: boolean;
};

export type ChartBarSeriesType = ChartSeriesBaseType & {
  type: "bar";
  /** `"dashed"` draws an outline without fill, beneath the solid bars it shares a column with. */
  variant?: "solid" | "dashed";
};

export type ChartLineSeriesType = ChartSeriesBaseType & {
  type: "line";
  /** `"monotone"` is smooth and never overshoots a point. Default `"linear"`. */
  curve?: "linear" | "monotone";
  /** A dot on every point. */
  dots?: boolean;
};

export type ChartSeriesType = ChartBarSeriesType | ChartLineSeriesType;

/** `"grouped"`: the bar series of a column stand side by side; `"overlap"`: they share the column, one over another. */
export type ChartBarLayoutType = "grouped" | "overlap";

export type ChartTooltipValueType = { series: ChartSeriesType; value: number | null };
