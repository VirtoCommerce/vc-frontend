import { computed, onScopeDispose, watch } from "vue";
import { useI18n } from "vue-i18n";
import { LAYOUT_REGION_IDS } from "../constants";
import { getBlock } from "../layout/registry";
import { useLayoutAnnouncer } from "./useLayoutAnnouncer";
import { focusBlockControl, focusEditToggle, focusSaveButton, focusSurfaceStart } from "./useLayoutFocus";
import { useSalesRepLayout } from "./useSalesRepLayout";
import type { SalesRepLayoutScopeType } from "../types/layout";

/** Everything a layout surface needs on top of `useSalesRepLayout`. */
export function useLayoutPage(scope: SalesRepLayoutScopeType) {
  const { t } = useI18n();
  const layout = useSalesRepLayout(scope);
  const { message, announce, say } = useLayoutAnnouncer(scope);
  const { setHidden, visibleIn, hiddenIn, editing, saveFailed } = layout;

  // Widgets from both columns share one tray; the stat row has its own paired zone instead.
  const hiddenWidgets = computed(() => hiddenIn("mainLeft").concat(hiddenIn("mainRight")));

  const allHidden = computed(
    () => !editing.value && LAYOUT_REGION_IDS.every((regionId) => visibleIn(regionId).length === 0),
  );

  const componentOf = (id: string) => {
    const block = getBlock(scope, id);
    return block && "component" in block ? block.component : undefined;
  };

  // Per-block props from the registry (e.g. `filterable` on the orders widget), so a page's slot stays
  // one generic `<component>` instead of branching per id and drifting from the registry.
  const propsOf = (id: string): Record<string, unknown> => {
    const block = getBlock(scope, id);
    return (block && "props" in block ? block.props : undefined) ?? {};
  };

  function toggleHidden(id: string, hidden: boolean, index?: number): void {
    setHidden(id, hidden, index);
    focusBlockControl(id);
  }

  function editFromEmpty(): void {
    layout.startEdit();
    focusSurfaceStart();
  }

  // Only the surface is inert while the write is in flight, so the rep can leave the page before it lands.
  let disposed = false;
  onScopeDispose(() => {
    disposed = true;
  });

  async function restoreDefaults(): Promise<void> {
    if ((await layout.restoreDefaults()) && !disposed) {
      say(t("sales_rep.hub.layout.restored"));
      focusSurfaceStart();
    }
  }

  // Entry rewrites the surface with nothing announcing it, and the arrow keys are otherwise only
  // discoverable by grabbing something. Exit unmounts the edit bar that held focus.
  watch(editing, (now, was) => {
    if (now && !was) {
      say(`${t("sales_rep.hub.layout.editing")}. ${t("sales_rep.hub.layout.hint_keyboard")}`);
    } else if (was && !now) {
      focusEditToggle();
    }
  });

  // VcAlert carries no live-region semantics, so the failure is otherwise visual only. Focus has to
  // come back too — `inert` dropped it to `<body>` when the save started, and edit mode is still on.
  watch(saveFailed, (failed) => {
    if (failed) {
      say(t("sales_rep.hub.layout.save_failed"));
      focusSaveButton();
    }
  });

  // Listed rather than spread, so this is the whole surface a page gets. `setHidden` is deliberately
  // absent: `toggleHidden` is the same call plus the focus move, and reaching past it would silently
  // lose focus after every park. `state` is absent too — pages read halves through
  // `visibleIn`/`hiddenIn`, so the whole object is a shape only the composable's own tests need.
  return {
    message,
    announce,
    hiddenWidgets,
    allHidden,
    componentOf,
    propsOf,
    toggleHidden,
    editFromEmpty,
    restoreDefaults,
    loading: layout.loading,
    saving: layout.saving,
    editing: layout.editing,
    canEdit: layout.canEdit,
    loadFailed: layout.loadFailed,
    saveFailed: layout.saveFailed,
    visibleIn,
    hiddenIn: layout.hiddenIn,
    settingsOf: layout.settingsOf,
    persistedSettingsOf: layout.persistedSettingsOf,
    updateSettings: layout.updateSettings,
    startEdit: layout.startEdit,
    cancel: layout.cancel,
    reset: layout.reset,
    reorderVisible: layout.reorderVisible,
    reorderHidden: layout.reorderHidden,
    save: layout.save,
  };
}
