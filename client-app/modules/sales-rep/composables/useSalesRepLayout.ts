import { useMutation } from "@vue/apollo-composable";
import { computed, readonly, ref } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepLayoutDocument, SaveSalesRepLayoutDocument } from "../api/graphql/types";
import { echoMatchesSentBlocks, reconcileLayout, serializeLayout } from "../layout/document";
import { getBlockRegistry } from "../layout/registry";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type {
  SalesRepBlockSettingsType,
  SalesRepLayoutRegionIdType,
  SalesRepLayoutScopeType,
  SalesRepLayoutStateType,
} from "../types/layout";

const EMPTY_SETTINGS: SalesRepBlockSettingsType = { hiddenTabs: [] };

function cloneState(state: SalesRepLayoutStateType): SalesRepLayoutStateType {
  return {
    regions: {
      statistics: { visible: [...state.regions.statistics.visible], hidden: [...state.regions.statistics.hidden] },
      mainLeft: { visible: [...state.regions.mainLeft.visible], hidden: [...state.regions.mainLeft.hidden] },
      mainRight: { visible: [...state.regions.mainRight.visible], hidden: [...state.regions.mainRight.hidden] },
    },
    settings: Object.fromEntries(
      Object.entries(state.settings).map(([id, values]) => [id, { ...values, hiddenTabs: [...values.hiddenTabs] }]),
    ),
  };
}

/**
 * Drives one layout surface. `startEdit` snapshots into a draft, every change targets the draft, and
 * `save` writes the whole document in one mutation (the backend replaces, not merges). `reset` refills
 * the draft from registry defaults but still needs a save, so a stray click is recoverable.
 */
export function useSalesRepLayout(scope: SalesRepLayoutScopeType) {
  const registry = getBlockRegistry(scope);

  // `no-cache` even with layout/cache-policies.ts in place: a save echoes `saveSalesRepLayout`, a
  // different root field, so it never refreshes a cached `salesRepLayout`.
  const { result, loading, error, onError, refetch } = useSalesRepHubQuery(
    SalesRepLayoutDocument,
    () => ({
      scope,
      storeId: globals.storeId,
    }),
    { fetchPolicy: "no-cache" },
  );

  onError((queryError) => {
    Logger.error("[sales-rep] salesRepLayout failed:", queryError);
  });

  // A mutation writes its result to the cache too, so it needs the same policy. No suppress context: a failed
  // save is a user action, so it keeps the toast (VCST-5682).
  const { mutate, loading: saving } = useMutation(SaveSalesRepLayoutDocument, { fetchPolicy: "no-cache" });

  // Layout as last persisted (or registry defaults when the rep has never saved this surface).
  const savedState = ref<SalesRepLayoutStateType | undefined>();
  const draft = ref<SalesRepLayoutStateType | undefined>();
  const editing = computed(() => draft.value !== undefined);
  const saveFailed = ref(false);

  const persisted = computed(() => savedState.value ?? reconcileLayout(result.value?.salesRepLayout, registry));
  const state = computed(() => draft.value ?? persisted.value);

  // Only a read with nothing to show yet blanks the surface. `refetch` sets `loading` true too
  // (apollo-composable does it unconditionally, index.mjs:530), and swapping a live layout for the
  // skeleton mid-edit would unmount the edit bar and take focus with it.
  const initialLoading = computed(() => loading.value && !result.value && !savedState.value);

  // A save replaces the whole document, so a failed read must not be editable — we would overwrite an
  // arrangement we could not fetch. `null` is the never-saved case and stays editable.
  const canEdit = computed(() => !loading.value && !error.value);

  // Exposed so the surface can say why editing is unavailable: without it the rep sees registry
  // defaults where their own arrangement should be, and no edit button, with nothing explaining either.
  const loadFailed = computed(() => Boolean(error.value));

  function visibleIn(regionId: SalesRepLayoutRegionIdType): readonly string[] {
    return state.value.regions[regionId].visible;
  }

  function hiddenIn(regionId: SalesRepLayoutRegionIdType): readonly string[] {
    return state.value.regions[regionId].hidden;
  }

  /** A block with no declared settings has none — the shared empty keeps callers from branching. */
  function settingsOf(blockId: string): SalesRepBlockSettingsType {
    return state.value.settings[blockId] ?? EMPTY_SETTINGS;
  }

  /** The saved value, ignoring any draft: a row cap is a query variable, so it applies on save
   * rather than refiring the query per keystroke. */
  function persistedSettingsOf(blockId: string): SalesRepBlockSettingsType {
    return persisted.value.settings[blockId] ?? EMPTY_SETTINGS;
  }

  function updateSettings(blockId: string, patch: Partial<SalesRepBlockSettingsType>): void {
    // Only a block the registry declared settings for: an unknown id would create an entry
    // `serializeSettings` then drops, so the rep would see a change that never persists.
    if (editable() && draft.value?.settings[blockId]) {
      draft.value.settings[blockId] = { ...draft.value.settings[blockId], ...patch };
    }
  }

  function startEdit(): void {
    if (!canEdit.value) {
      return;
    }
    saveFailed.value = false;
    draft.value = cloneState(persisted.value);
  }

  function cancel(): void {
    draft.value = undefined;
    saveFailed.value = false;
  }

  // `save` snapshots the payload synchronously and clears the draft on resolve, so a mid-flight edit
  // lands in a document nobody sends and is then discarded. The pages' `inert` covers the UI; this
  // covers the programmatic paths an attribute cannot.
  function editable(): boolean {
    return draft.value !== undefined && !saving.value;
  }

  function reset(): void {
    if (editable()) {
      draft.value = reconcileLayout(null, registry);
      // Otherwise a previous failure's alert sits over a freshly rebuilt draft.
      saveFailed.value = false;
    }
  }

  // Ids are copied, not stored as given: callers read them out of `state`, which is exported
  // `readonly()`, and Vue's readonly arrays are not assignable to a mutable draft.
  function reorderVisible(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
    if (editable() && draft.value) {
      draft.value.regions[regionId].visible = [...ids];
    }
  }

  function reorderHidden(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
    if (editable() && draft.value) {
      draft.value.regions[regionId].hidden = [...ids];
    }
  }

  /**
   * Move a block between its region's halves. `index` is where it was dropped, else the end. A block
   * already in the destination is not in the source half, so a redundant call is a no-op.
   */
  function setHidden(id: string, hidden: boolean, index?: number): void {
    if (!draft.value || !editable()) {
      return;
    }

    for (const region of Object.values(draft.value.regions)) {
      const from = hidden ? region.visible : region.hidden;
      const at = from.indexOf(id);
      if (at === -1) {
        continue;
      }

      const to = hidden ? region.hidden : region.visible;
      from.splice(at, 1);
      to.splice(index ?? to.length, 0, id);
      return;
    }
  }

  // `saving`, not just `draft`: the draft is only cleared once the first save resolves, so anything
  // holding a reference could otherwise fire a second full-document replace mid-flight. The pages'
  // `inert` covers the buttons; this covers the programmatic paths an attribute cannot.
  async function save(): Promise<boolean> {
    if (!draft.value || saving.value) {
      return false;
    }

    const pending = draft.value;
    const command = serializeLayout(pending, scope, registry, globals.storeId);
    try {
      const response = await mutate({ command });
      const saved = response?.data?.saveSalesRepLayout;

      // Without a document there is nothing to trust: reconciling `undefined` yields registry
      // defaults, which would silently replace the rep's arrangement and report success.
      if (!saved) {
        Logger.error("[sales-rep] saveSalesRepLayout returned no document");
        saveFailed.value = true;
        return false;
      }

      // A contradictory echo means neither side can be trusted: adopting it would revert the rep's
      // hides, and adopting the draft would make a document the backend never stored look canonical
      // with no later read to correct it. So refetch, and report a failure the rep can retry.
      if (!echoMatchesSentBlocks(saved, command)) {
        Logger.error("[sales-rep] saveSalesRepLayout echoed a document that disagrees with what was sent");
        // Cleared so `persisted` reads the refetch rather than a stale echo. The draft stays, so the
        // rep keeps their arrangement and edit mode.
        savedState.value = undefined;
        refetch()?.catch((refetchError: unknown) => {
          Logger.error("[sales-rep] salesRepLayout refetch after a disagreeing echo failed:", refetchError);
        });
        saveFailed.value = true;
        return false;
      }

      savedState.value = reconcileLayout(saved, registry);
      draft.value = undefined;
      saveFailed.value = false;
      return true;
    } catch (mutationError) {
      // Keep edit mode and the draft — the rep's arrangement is not thrown away on a failed write.
      Logger.error("[sales-rep] saveSalesRepLayout failed:", mutationError);
      saveFailed.value = true;
      return false;
    }
  }

  return {
    state: readonly(state),
    loading: initialLoading,
    saving,
    editing,
    canEdit,
    loadFailed,
    saveFailed: readonly(saveFailed),
    visibleIn,
    hiddenIn,
    settingsOf,
    persistedSettingsOf,
    updateSettings,
    startEdit,
    cancel,
    reset,
    reorderVisible,
    reorderHidden,
    setHidden,
    save,
  };
}
