// The dashboard layout engine's vocabulary (VCST-5367, moved to the core in VCST-6078). A dashboard stores a
// per-user document of block order + hidden flags; the registry (registry.ts) says which blocks exist.
import type { Component, DeepReadonly, Ref } from "vue";

/** Fixed regions. Owned by the registry, never read back from the document — widgets are built for
 * their column's width, so region is code, not user data. */
export type LayoutRegionIdType = "statistics" | "mainLeft" | "mainRight";

/** A setting a block exposes in layout-edit mode (VCST-5649). */
export type BlockSettingType =
  /** Row cap for a list widget. `min`/`max` are per block: an API may cap its page size. */
  | { kind: "maxRows"; default: number; min: number; max: number }
  /** Which of the widget's filter-rule tabs to offer. The catalog is whatever the widget's backend returns. */
  | { kind: "ruleTabs" };

export type MaxRowsSettingType = Extract<BlockSettingType, { kind: "maxRows" }>;

/**
 * A block's settings as the UI reads them — deliberately not the wire shape, which is a flat
 * key/value list of scalars (see `settings.ts`).
 */
export type BlockSettingsType = {
  maxRows?: number;
  /** Rule names the user unchecked. Absent means shown, so a rule added later needs no migration. */
  hiddenTabs: readonly string[];
};

interface IBlockBase {
  /** Stable id, persisted as BOTH block.id and block.type — a user never holds two of one type. */
  id: string;
  /** i18n key; used for the hidden-tray label and the keyboard announcements. */
  titleKey: string;
  /** Default position within the region. Applies only to blocks absent from the saved document. */
  order: number;
  defaultHidden?: boolean;
}

/** A KPI card in the stat row. Its `id` is a `StatCardType.key`; the stat row renders it. */
export interface IStatBlock extends IBlockBase {
  region: "statistics";
}

/** A widget in one of the two content columns. Renders through layout-widget.vue, which puts the drag
 * controls in the widget's own header slots. */
export interface IWidgetBlock extends IBlockBase {
  region: "mainLeft" | "mainRight";
  component: Component;
  /** Extra props for `component`. `title` comes from `titleKey` and is passed by the surface. */
  props?: Record<string, unknown>;
  /** What the user can configure in edit mode. Absent = nothing, which is most blocks. */
  settings?: readonly BlockSettingType[];
}

export type BlockType = IStatBlock | IWidgetBlock;

/**
 * A region's two halves, each in render order. Two arrays rather than one flagged list — order across
 * the boundary is state nothing can display. The `hidden` flag exists only in `document.ts`.
 */
export type LayoutRegionType = { visible: string[]; hidden: string[] };

/**
 * The reconciled layout — every region in render order, plus every configurable block's settings.
 * One object rather than two, so the edit draft, Cancel and Reset cover settings with no second
 * state machine to keep in step.
 */
export type LayoutStateType = {
  regions: Record<LayoutRegionIdType, LayoutRegionType>;
  /** Keyed by block id. A block declaring no settings never appears. */
  settings: Record<string, BlockSettingsType>;
};

/**
 * One dashboard's layout as the page drives it: the saved document, the edit draft and persistence. The page
 * creates it, hands it to `<LayoutSurface :layout>` and shapes its statistics queries from it
 * (`useStatDataNeeds`), so neither side has to find the other through shared state.
 */
export type LayoutControllerType = {
  /** The dashboard; its blocks are registered under this name. */
  scope: string;
  /** The draft while editing, the saved layout otherwise (registry defaults when never saved). */
  state: Readonly<Ref<DeepReadonly<LayoutStateType>>>;
  /** Only the first read: the surface shows a skeleton until the saved arrangement is known. */
  loading: Readonly<Ref<boolean>>;
  saving: Readonly<Ref<boolean>>;
  editing: Readonly<Ref<boolean>>;
  /** False while loading and after a failed read — a save replaces the whole document. */
  canEdit: Readonly<Ref<boolean>>;
  loadFailed: Readonly<Ref<boolean>>;
  saveFailed: Readonly<Ref<boolean>>;
  /** The saved document has been read, or the read failed and registry defaults are final. */
  settled: Readonly<Ref<boolean>>;
  visibleIn: (regionId: LayoutRegionIdType) => readonly string[];
  hiddenIn: (regionId: LayoutRegionIdType) => readonly string[];
  /** The draft's values while editing; a block with no declared settings gets the shared empty. */
  settingsOf: (blockId: string) => BlockSettingsType;
  /** The saved values, ignoring the draft — what a widget fetches with, so typing does not refetch. */
  persistedSettingsOf: (blockId: string) => BlockSettingsType;
  updateSettings: (blockId: string, patch: Partial<BlockSettingsType>) => void;
  startEdit: () => void;
  cancel: () => void;
  /** Refills the draft from registry defaults; still needs a save. */
  reset: () => void;
  reorderVisible: (regionId: LayoutRegionIdType, ids: string[]) => void;
  reorderHidden: (regionId: LayoutRegionIdType, ids: string[]) => void;
  /** Moves a block between its region's halves; `index` is where it was dropped, else the end. */
  setHidden: (id: string, hidden: boolean, index?: number) => void;
  /** Resolves `false` when the save failed or was refused; the draft is kept either way. */
  save: () => Promise<boolean>;
};

/**
 * What `createLayoutController` drives one dashboard's layout over: where its document lives, and which blocks it is
 * reconciled against.
 */
export type LayoutControllerOptionsType = {
  /** The dashboard; the backend keys the document by it, and its blocks are registered under it. */
  scope: string;
  /** Sent with every save: a user keeps one document per dashboard and store. */
  storeId?: string;
  /** Reads the saved document; resolves `null` (or `undefined`) when the user never saved this dashboard. */
  load: () => Promise<SavedLayoutType | null | undefined>;
  /** Replaces the whole document and resolves to it as stored — the controller trusts only an echo of what it sent. */
  save: (command: LayoutInputType) => Promise<SavedLayoutType | null | undefined>;
  /**
   * The blocks the document is reconciled against; their region, order and `defaultHidden` are what a user who
   * never saved sees. Called on every use, so a block registered later still joins.
   */
  defaults: () => readonly BlockType[];
};

/** What the statistics queries read off a layout: whether it is known yet, edit mode, and what is visible. */
export type LayoutVisibilityType = Pick<LayoutControllerType, "settled" | "editing" | "visibleIn">;

/** What a dashboard's statistics composables take (`useStatDataNeeds`): which slices to ask for, and whether to
 * ask yet. */
export type StatDataNeedsType<TNeed extends string> = {
  needs: Readonly<Ref<ReadonlySet<TNeed>>>;
  ready: Readonly<Ref<boolean>>;
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

// Minimal shape of a persisted document. A backend's generated query result is structurally assignable to
// these, which keeps the pure functions independent of codegen.
export type SavedLayoutSettingType = { key: string; value?: unknown };
export type SavedLayoutBlockType = { type: string; hidden: boolean; settings?: readonly SavedLayoutSettingType[] };
export type SavedLayoutRegionType = { blocks: readonly SavedLayoutBlockType[] };
export type SavedLayoutType = { regions: readonly SavedLayoutRegionType[] };

// The save command, also structural: it is assignable to a backend's generated input type for it.
export type LayoutInputBlockType = { id: string; type: string; hidden: boolean; settings: SavedLayoutSettingType[] };
export type LayoutInputRegionType = { id: LayoutRegionIdType; blocks: LayoutInputBlockType[] };
export type LayoutInputType = {
  scope: string;
  storeId?: string;
  schemaVersion: number;
  regions: LayoutInputRegionType[];
};

/**
 * Presentational model of a KPI card. Only `labelKey` is localized by the stat row — value, sub and delta are
 * pre-formatted strings owned by the dashboard that builds the card. Delta tone: `positive` = higher than the
 * previous period (green), `negative` = lower (red), `neutral` = unchanged or a plain informational count.
 */
export type StatCardType = {
  /** The `statistics` block id this card renders as. */
  key: string;
  labelKey: string;
  icon: string;
  value: string;
  // Optional to match <VcStatCard>'s contract: color and deltaTone have defaults, and sub/delta/deltaIcon are
  // v-if-guarded, so a card can omit any of them.
  color?: VcStatCardColorType;
  /** De-emphasized unit rendered right after `value` (e.g. "items" in "34 items"). */
  valueSuffix?: string;
  sub?: string;
  delta?: string;
  deltaTone?: VcStatCardToneType;
  deltaIcon?: string;
  // Both per-card, because each card is fed by exactly one statistics query (VCST-5586): one query failing must
  // not blank the cards whose data arrived, and one query still in flight must not hold every card at the
  // pending placeholder — which would also hide a sibling card's error, since <VcStatCard> puts loading first.
  loading?: boolean;
  failed?: boolean;
};
