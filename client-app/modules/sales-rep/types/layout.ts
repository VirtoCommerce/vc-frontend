// Saved dashboard / customer-profile layout (VCST-5367). The backend stores a per-rep document of
// block order + hidden flags; see ../specs/VCST-5367-srh-layout-drag-and-drop/.
import type { Component } from "vue";

/** Layout surface. Free-form `String` server-side — the literals live in constants.ts. */
export type SalesRepLayoutScopeType = "dashboard" | "customerProfile";

/**
 * Fixed regions. A block's region is owned by the registry and is never read back from the saved
 * document: `mainLeft` (wide content) and `mainRight` (narrow rail) hold widgets built for their
 * width, so region is code, not user data.
 */
export type SalesRepLayoutRegionIdType = "statistics" | "mainLeft" | "mainRight";

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

/** A widget in one of the two content columns. */
export interface ISalesRepWidgetBlock extends ISalesRepBlockBase {
  region: "mainLeft" | "mainRight";
  component: Component;
}

export type SalesRepBlockType = ISalesRepStatBlock | ISalesRepWidgetBlock;

/** One entry of the reconciled layout. Order is array position. */
export type SalesRepLayoutEntryType = { id: string; hidden: boolean };

/** The reconciled layout — every region, in render order. */
export type SalesRepLayoutStateType = Record<SalesRepLayoutRegionIdType, SalesRepLayoutEntryType[]>;

/** Stat rows read left-to-right; widget columns read top-to-bottom. */
export type KeyboardSortOrientationType = "horizontal" | "vertical";

/**
 * What a keyboard sort just did. The composable stays free of i18n — the caller turns these into
 * the localized text pushed to the `aria-live` region.
 */
export type KeyboardSortSignalType =
  /** `parkable` picks the wording: only the stat row can hide a block with the arrow keys. */
  | { kind: "grabbed"; id: string; index: number; total: number; parkable: boolean }
  | { kind: "moved" | "dropped"; id: string; index: number; total: number }
  | { kind: "cancelled" | "parked" | "restored"; id: string };

// Minimal shape of a persisted document. The generated `SalesRepLayoutQuery` result is structurally
// assignable to these, which keeps the pure functions independent of codegen.
export type SavedLayoutBlockType = { type: string; hidden: boolean };
export type SavedLayoutRegionType = { blocks: readonly SavedLayoutBlockType[] };
export type SavedLayoutType = { regions: readonly SavedLayoutRegionType[] };
