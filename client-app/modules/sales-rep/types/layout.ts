// Saved dashboard / customer-profile layout (VCST-5367). The backend stores a per-rep document of
// block order + hidden flags; see ../specs/VCST-5367-srh-layout-drag-and-drop/.
import type { SalesRepRuleDomainType } from "./index";
import type { Component } from "vue";

/** Layout surface. Free-form `String` server-side — the literals live in constants.ts. */
export type SalesRepLayoutScopeType = "dashboard" | "customerProfile";

/** Fixed regions. Owned by the registry, never read back from the document — widgets are built for
 * their column's width, so region is code, not user data. */
export type SalesRepLayoutRegionIdType = "statistics" | "mainLeft" | "mainRight";

/** A setting a block exposes in layout-edit mode (VCST-5649). */
export type SalesRepBlockSettingType =
  /** Row cap for a list widget. `min`/`max` are per block: the top-seller API caps `take` at 10. */
  | { kind: "maxRows"; default: number; min: number; max: number }
  /** Which of the widget's filter-rule tabs to offer. The catalog is whatever the backend returns. */
  | { kind: "ruleTabs"; domain: SalesRepRuleDomainType };

/**
 * A block's settings as the UI reads them — deliberately not the wire shape, which is a flat
 * key/value list of scalars (see `layout/settings.ts`).
 */
export type SalesRepBlockSettingsType = {
  maxRows?: number;
  /** Rule names the rep unchecked. Absent means shown, so a rule added later needs no migration. */
  hiddenTabs: readonly string[];
};

interface ISalesRepBlockBase {
  /** Stable id, persisted as BOTH block.id and block.type — a rep never holds two of one type. */
  id: string;
  /** i18n key; used for the hidden-tray label and the keyboard announcements. */
  titleKey: string;
  /** Default position within the region. Applies only to blocks absent from the saved document. */
  order: number;
  defaultHidden?: boolean;
}

/** A KPI card in the stat row. Its `id` is a `StatWidgetCardType.key`; the stat row renders it. */
export interface ISalesRepStatBlock extends ISalesRepBlockBase {
  region: "statistics";
}

/** A widget in one of the two content columns. Renders through layout-widget.vue, which puts the drag
 * controls in the widget's own header slots. */
export interface ISalesRepWidgetBlock extends ISalesRepBlockBase {
  region: "mainLeft" | "mainRight";
  component: Component;
  /** Extra props for `component`. `title` comes from `titleKey` and is passed by the page. */
  props?: Record<string, unknown>;
  /** What the rep can configure in edit mode. Absent = nothing, which is most blocks. */
  settings?: readonly SalesRepBlockSettingType[];
}

export type SalesRepBlockType = ISalesRepStatBlock | ISalesRepWidgetBlock;

/**
 * A region's two halves, each in render order. Two arrays rather than one flagged list — order across
 * the boundary is state nothing can display. The `hidden` flag exists only in `layout/document.ts`.
 */
export type SalesRepLayoutRegionType = { visible: string[]; hidden: string[] };

/**
 * The reconciled layout — every region in render order, plus every configurable block's settings.
 * One object rather than two, so the edit draft, Cancel and Reset cover settings with no second
 * state machine to keep in step.
 */
export type SalesRepLayoutStateType = {
  regions: Record<SalesRepLayoutRegionIdType, SalesRepLayoutRegionType>;
  /** Keyed by block id. A block declaring no settings never appears. */
  settings: Record<string, SalesRepBlockSettingsType>;
};

/** Stat rows read left-to-right; widget columns read top-to-bottom. */
export type KeyboardSortOrientationType = "horizontal" | "vertical";

/** What a keyboard sort just did; the caller localizes it for the `aria-live` region. */
export type KeyboardSortSignalType =
  /** `parkable` picks the wording: only the stat row can hide a block with the arrow keys. */
  | { kind: "grabbed"; id: string; index: number; total: number; parkable: boolean }
  /** `edge` reports a move that could not happen: silence leaves an SR user unable to tell why. */
  | { kind: "moved" | "dropped" | "edge"; id: string; index: number; total: number }
  | { kind: "cancelled" | "parked" | "restored"; id: string };

// Minimal shape of a persisted document. The generated `SalesRepLayoutQuery` result is structurally
// assignable to these, which keeps the pure functions independent of codegen.
export type SavedLayoutSettingType = { key: string; value?: unknown };
export type SavedLayoutBlockType = { type: string; hidden: boolean; settings?: readonly SavedLayoutSettingType[] };
export type SavedLayoutRegionType = { blocks: readonly SavedLayoutBlockType[] };
export type SavedLayoutType = { regions: readonly SavedLayoutRegionType[] };
