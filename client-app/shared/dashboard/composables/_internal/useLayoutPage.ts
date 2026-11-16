import { computed, onScopeDispose, watch } from "vue";
import { useI18n } from "vue-i18n";
import { LAYOUT_REGION_IDS } from "../../constants";
import { getBlock } from "../../registry";
import { useLayoutAnnouncer } from "./useLayoutAnnouncer";
import { useLayoutFocus } from "./useLayoutFocus";
import type { LayoutControllerType } from "../../types";
import type { MaybeRefOrGetter } from "vue";

/**
 * Everything a layout surface needs on top of the page's layout controller. `root` is the surface's own element:
 * the focus moves stay inside it.
 */
export function useLayoutPage(layout: LayoutControllerType, root: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const { t } = useI18n();
  const { scope } = layout;
  const { message, announce, say, clear } = useLayoutAnnouncer(scope);
  const { focusBlockControl, focusEditToggle, focusSaveButton, focusSurfaceStart } = useLayoutFocus(root);
  const { setHidden, visibleIn, hiddenIn, editing, saveFailed, canEdit } = layout;

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

  // Only the surface is inert while the write is in flight, so the user can leave the page before it lands.
  let disposed = false;
  onScopeDispose(() => {
    disposed = true;
  });

  async function restoreDefaults(): Promise<void> {
    if ((await layout.restoreDefaults()) && !disposed) {
      say(t("shared.dashboard.restored"));
      focusSurfaceStart();
    }
  }

  // Entry rewrites the surface with nothing announcing it, and the arrow keys are otherwise only
  // discoverable by grabbing something. Exit unmounts the edit bar that held focus, and ends whatever the last
  // announcement described (editing, a move, a failed save), so the region is emptied too.
  watch(editing, (now, was) => {
    if (now && !was) {
      say(t("shared.dashboard.a11y.editing"));
    } else if (was && !now) {
      clear();
      focusEditToggle();
    }
  });

  // VcAlert carries no live-region semantics, so the failure is otherwise visual only.
  watch(saveFailed, (failed) => {
    if (failed) {
      say(t("shared.dashboard.save_failed"));
    }
  });

  // `inert` dropped focus to `<body>` when the save started, and a failure keeps edit mode on, so Save takes focus
  // back as soon as it can be used: at once, or once a stored document being read again has landed (Save is disabled
  // until then). Focus the user has moved elsewhere meanwhile stays where it is.
  watch(
    () => editing.value && saveFailed.value && canEdit.value,
    (ready) => {
      if (ready && document.activeElement === document.body) {
        focusSaveButton();
      }
    },
  );

  // Listed rather than spread, so this is the whole surface a page gets. `setHidden` is deliberately
  // absent: `toggleHidden` is the same call plus the focus move, and reaching past it would silently
  // lose focus after every park. `state` is absent too — the surface reads halves through
  // `visibleIn`/`hiddenIn`, so the whole object is a shape only the controller's own tests need.
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
