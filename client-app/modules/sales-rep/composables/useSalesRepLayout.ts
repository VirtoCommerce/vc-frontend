import { useMutation, useQuery } from "@vue/apollo-composable";
import { computed, readonly, ref } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepLayoutDocument, SaveSalesRepLayoutDocument } from "../api/graphql/types";
import { reconcileLayout, serializeLayout } from "../layout/document";
import { getBlockRegistry } from "../layout/registry";
import type {
  SalesRepLayoutEntryType,
  SalesRepLayoutRegionIdType,
  SalesRepLayoutScopeType,
  SalesRepLayoutStateType,
} from "../types/layout";

function cloneState(state: SalesRepLayoutStateType): SalesRepLayoutStateType {
  return {
    statistics: state.statistics.map((entry) => ({ ...entry })),
    mainLeft: state.mainLeft.map((entry) => ({ ...entry })),
    mainRight: state.mainRight.map((entry) => ({ ...entry })),
  };
}

/**
 * Drives one layout surface: load, edit-mode draft, and save.
 *
 * Editing is explicit — `startEdit` snapshots the live layout into a draft, every change targets the
 * draft, and `save` writes the whole document in a single mutation (the backend replaces rather than
 * merges). `cancel` throws the draft away; `reset` refills it from registry defaults but still needs
 * a save to persist, so a stray click is recoverable.
 */
export function useSalesRepLayout(scope: SalesRepLayoutScopeType) {
  const registry = getBlockRegistry(scope);

  const { result, loading, error, onError } = useQuery(SalesRepLayoutDocument, () => ({
    scope,
    storeId: globals.storeId,
  }));

  onError((queryError) => {
    Logger.error("[sales-rep] salesRepLayout failed:", queryError);
  });

  const { mutate, loading: saving } = useMutation(SaveSalesRepLayoutDocument);

  // Layout as last persisted (or registry defaults when the rep has never saved this surface).
  const savedState = ref<SalesRepLayoutStateType | undefined>();
  const draft = ref<SalesRepLayoutStateType | undefined>();
  const editing = computed(() => draft.value !== undefined);
  const saveFailed = ref(false);

  const persisted = computed(() => savedState.value ?? reconcileLayout(result.value?.salesRepLayout, registry));
  const state = computed(() => draft.value ?? persisted.value);

  /**
   * A save replaces the entire document. If the read failed we do not know what is stored, so
   * offering to overwrite it would risk destroying an arrangement we simply could not fetch. A
   * `null` result is different — that is the ordinary never-saved case and editing stays available.
   */
  const canEdit = computed(() => !loading.value && !error.value);

  function visibleIn(regionId: SalesRepLayoutRegionIdType): SalesRepLayoutEntryType[] {
    return state.value[regionId].filter((entry) => !entry.hidden);
  }

  function hiddenIn(regionId: SalesRepLayoutRegionIdType): SalesRepLayoutEntryType[] {
    return state.value[regionId].filter((entry) => entry.hidden);
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

  function reset(): void {
    if (draft.value) {
      draft.value = reconcileLayout(null, registry);
    }
  }

  /** Reorder within a region. Blocks never move between regions — region is owned by the registry. */
  function reorder(regionId: SalesRepLayoutRegionIdType, entries: SalesRepLayoutEntryType[]): void {
    if (draft.value) {
      draft.value[regionId] = entries;
    }
  }

  function setHidden(id: string, hidden: boolean): void {
    for (const regionId of Object.keys(draft.value ?? {}) as SalesRepLayoutRegionIdType[]) {
      const entry = draft.value?.[regionId].find((candidate) => candidate.id === id);
      if (entry) {
        entry.hidden = hidden;
        return;
      }
    }
  }

  async function save(): Promise<boolean> {
    if (!draft.value) {
      return false;
    }

    const pending = draft.value;
    try {
      const response = await mutate({ command: serializeLayout(pending, scope, globals.storeId) });
      // The mutation echoes the stored document, so reconcile from it rather than refetching.
      savedState.value = reconcileLayout(response?.data?.saveSalesRepLayout, registry);
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
    loading,
    saving,
    editing,
    canEdit,
    saveFailed: readonly(saveFailed),
    visibleIn,
    hiddenIn,
    startEdit,
    cancel,
    reset,
    reorder,
    setHidden,
    save,
  };
}
