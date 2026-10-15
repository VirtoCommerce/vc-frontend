// The dashboard layout engine's public surface for TypeScript: the only entry point code outside
// `shared/dashboard` imports from, the account dashboard's registration in `app-runner.ts` included. Nothing here re-exports an
// `_internal/` file.
//
// The two public components are NOT re-exported: code that renders them imports them by file
// (`components/layout-surface.vue`, `components/layout-widget.vue`). A `.vue` re-export would pull the
// engine's styles into every chunk that imports this file — and module `init()` code loads with the app.
// A Module Federation plugin gets the engine through the `@vc-frontend/core` facade (`core-api/index.ts` exports
// the same surface from these files), never through this barrel; the Sales Rep Hub plugin runs on it.
export { provideBlockChrome, useBlockChrome } from "./composables/useBlockChrome";
export { createLayoutController, useLayout } from "./composables/useLayout";
export { useStatDataNeeds } from "./composables/useStatDataNeeds";
export { LAYOUT_SCOPES, MIN_ROWS } from "./constants";
export { echoMatchesSentBlocks, reconcileLayout, serializeLayout } from "./document";
export { getBlock, getBlockRegistry, registerBlock, unregisterBlock } from "./registry";
export { knownHiddenTabs, toggleTabRule, visibleTabRules } from "./settings";
export { buildStatCards, statBlocks, statCardState, statDataNeeds } from "./stat-cards";
export {
  buildStatisticsWindows,
  eod,
  formatSignedPercent,
  formatStatCount,
  formatStatMoney,
  iso,
  local,
} from "./statistics";
export type { ILayoutBlockChromeType } from "./composables/useBlockChrome";
export type { IStatCardDefType, StatCardDataType, StatNeedResultType, StatQueryStateType } from "./stat-cards";
export type { SignedPercentType, StatisticsWindowsType } from "./statistics";
export type {
  BlockSettingsType,
  BlockSettingType,
  BlockType,
  IStatBlock,
  IWidgetBlock,
  LayoutControllerOptionsType,
  LayoutControllerType,
  LayoutInputType,
  LayoutRegionIdType,
  LayoutStateType,
  LayoutVisibilityType,
  MaxRowsSettingType,
  SavedLayoutType,
  StatCardType,
  StatDataNeedsType,
} from "./types";
