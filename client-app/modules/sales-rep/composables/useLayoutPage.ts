import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getBlock } from "../layout/registry";
import { useLayoutAnnouncer } from "./useLayoutAnnouncer";
import { focusBlockControl, focusEditToggle, focusSaveButton } from "./useLayoutFocus";
import { useSalesRepLayout } from "./useSalesRepLayout";
import type { SalesRepLayoutScopeType } from "../types/layout";

/** Everything a layout surface needs on top of `useSalesRepLayout`. */
export function useLayoutPage(scope: SalesRepLayoutScopeType) {
  const { t } = useI18n();
  const layout = useSalesRepLayout(scope);
  const { message, announce, say } = useLayoutAnnouncer(scope);
  const { setHidden, hiddenIn, editing, saveFailed } = layout;

  // Widgets from both columns share one tray; the stat row has its own paired zone instead.
  const hiddenWidgets = computed(() => hiddenIn("mainLeft").concat(hiddenIn("mainRight")));

  // eslint-disable-next-line sonarjs/function-return-type -- component or undefined by design
  const componentOf = (id: string) => {
    const block = getBlock(scope, id);
    return block && "component" in block ? block.component : undefined;
  };

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
    componentOf,
    toggleHidden,
    loading: layout.loading,
    saving: layout.saving,
    editing: layout.editing,
    canEdit: layout.canEdit,
    loadFailed: layout.loadFailed,
    saveFailed: layout.saveFailed,
    visibleIn: layout.visibleIn,
    hiddenIn: layout.hiddenIn,
    startEdit: layout.startEdit,
    cancel: layout.cancel,
    reset: layout.reset,
    reorderVisible: layout.reorderVisible,
    reorderHidden: layout.reorderHidden,
    save: layout.save,
  };
}
