import type { AnalyticsEventNameType } from "@/core/types/analytics";

export type TriggerType = "click" | "appear";

type ScopeType = {
  /** `data-vc-track` of the closest ancestor (or the element itself) to resolve from */
  from?: string;
  /** Without it, an unresolved argument skips the event */
  optional?: boolean;
};

export type AttrFieldType = {
  /** `dataset` key: `listId` reads `data-list-id` */
  attr: string;
  type?: "number";
};

export type ObjectSourceType = ScopeType & {
  source: "object";
  /** Target path (dot notation allowed) → attribute to read it from */
  fields: Record<string, AttrFieldType>;
};

export type ItemSourceType = ScopeType & {
  source: "item";
  /** Used for markup without a `v-track-item` object behind it */
  fallback?: ObjectSourceType;
};

export type ArgSourceType =
  | ItemSourceType
  | ObjectSourceType
  | (ScopeType & { source: "attr" } & AttrFieldType)
  | (ScopeType & { source: "collect"; target: string; fallback?: ObjectSourceType });

export type RuleType = {
  event: AnalyticsEventNameType;
  trigger: TriggerType;
  /** `data-vc-track` of the element the trigger fires on */
  target: string;
  /** Positional arguments of `analytics(event, ...args)` */
  args: ArgSourceType[];
};
