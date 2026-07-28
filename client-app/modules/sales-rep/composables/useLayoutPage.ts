import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getBlock } from "../layout/registry";
import { useLayoutAnnouncer } from "./useLayoutAnnouncer";
import { focusBlockControl, focusEditToggle } from "./useLayoutFocus";
import { useSalesRepLayout } from "./useSalesRepLayout";
import type { SalesRepLayoutRegionIdType, SalesRepLayoutScopeType } from "../types/layout";

/**
 * Everything a layout surface needs on top of `useSalesRepLayout`.
 *
 * The stitchers live here, not in each page: a region's visible and hidden entries are two views of ONE
 * ordered array, and `reorder` trusts the caller to return the whole thing visible-first. Spread across
 * pages, a third surface stitching it differently would corrupt state with nothing to catch it.
 */
export function useLayoutPage(scope: SalesRepLayoutScopeType) {
  const { t } = useI18n();
  const layout = useSalesRepLayout(scope);
  const { message, announce, say } = useLayoutAnnouncer(scope);
  const { state, reorder, setHidden, hiddenIn, editing, saveFailed } = layout;

  // Widgets from both columns share one tray; the stat row has its own paired zone instead.
  const hiddenWidgets = computed(() => hiddenIn("mainLeft").concat(hiddenIn("mainRight")));

  // eslint-disable-next-line sonarjs/function-return-type -- component or undefined by design
  const componentOf = (id: string) => {
    const block = getBlock(scope, id);
    return block && "component" in block ? block.component : undefined;
  };

  function reorderVisible(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
    reorder(regionId, [
      ...ids.map((id) => ({ id, hidden: false })),
      ...state.value[regionId].filter((entry) => entry.hidden),
    ]);
  }

  function reorderHidden(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
    reorder(regionId, [
      ...state.value[regionId].filter((entry) => !entry.hidden),
      ...ids.map((id) => ({ id, hidden: true })),
    ]);
  }

  function toggleHidden(id: string, hidden: boolean, index?: number): void {
    setHidden(id, hidden, index);
    focusBlockControl(id);
  }

  // Save and Cancel both unmount the edit bar they live on, taking focus with them.
  watch(editing, (now, was) => {
    if (was && !now) {
      focusEditToggle();
    }
  });

  // VcAlert carries no live-region semantics, so the failure is otherwise visual only.
  watch(saveFailed, (failed) => {
    if (failed) {
      say(t("sales_rep.hub.layout.save_failed"));
    }
  });

  return { ...layout, message, announce, hiddenWidgets, componentOf, reorderVisible, reorderHidden, toggleHidden };
}
