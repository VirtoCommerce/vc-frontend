// The dashboard layout engine's public surface for TypeScript: the only entry point code outside
// `shared/dashboard` imports from, the sales-rep module's startup code included. Nothing here re-exports an
// `_internal/` file.
//
// The two public components are NOT re-exported: code that renders them imports them by file
// (`components/layout-surface.vue`, `components/layout-widget.vue`). A `.vue` re-export would pull the
// engine's styles into every chunk that imports this file — and module `init()` code loads with the app.
// Module Federation plugins get the engine through the `@vc-frontend/core` facade (client-app/core-api).
export { provideBlockChrome, useBlockChrome } from "./composables/useBlockChrome";
export { useStatDataNeeds } from "./composables/useStatDataNeeds";
export { MIN_ROWS } from "./constants";
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
