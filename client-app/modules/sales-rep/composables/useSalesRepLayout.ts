import { useMutation, useQuery } from "@vue/apollo-composable";
import { computed, readonly, ref } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepLayoutDocument, SaveSalesRepLayoutDocument } from "../api/graphql/types";
import { echoCoversSentBlocks, reconcileLayout, serializeLayout } from "../layout/document";
import { getBlockRegistry } from "../layout/registry";
import type { SalesRepLayoutRegionIdType, SalesRepLayoutScopeType, SalesRepLayoutStateType } from "../types/layout";

function cloneState(state: SalesRepLayoutStateType): SalesRepLayoutStateType {
  return {
    statistics: { visible: [...state.statistics.visible], hidden: [...state.statistics.hidden] },
    mainLeft: { visible: [...state.mainLeft.visible], hidden: [...state.mainLeft.hidden] },
    mainRight: { visible: [...state.mainRight.visible], hidden: [...state.mainRight.hidden] },
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

  /**
   * `no-cache` on both operations. Regions and blocks carry an `id`, so Apollo normalizes them — and
   * region ids are fixed while `orders` is registered on both surfaces, making
   * `SalesRepLayoutRegion:statistics` a single entity shared by every scope. Cached, one surface
   * overwrites the other's regions, reconciliation drops the foreign types, and the rep silently gets
   * registry defaults that the next save makes permanent. Skipping the cache rather than adding host
   * `typePolicies` keeps the module portable as an MF remote (PORT_TO_MF.md).
   */
  const { result, loading, error, onError } = useQuery(
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

  // A mutation writes its result to the cache too, so it needs the same policy.
  const { mutate, loading: saving } = useMutation(SaveSalesRepLayoutDocument, { fetchPolicy: "no-cache" });

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

  // Exposed so the surface can say why editing is unavailable: without it the rep sees registry
  // defaults where their own arrangement should be, and no edit button, with nothing explaining either.
  const loadFailed = computed(() => Boolean(error.value));

  function visibleIn(regionId: SalesRepLayoutRegionIdType): readonly string[] {
    return state.value[regionId].visible;
  }

  function hiddenIn(regionId: SalesRepLayoutRegionIdType): readonly string[] {
    return state.value[regionId].hidden;
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
      draft.value[regionId].visible = [...ids];
    }
  }

  function reorderHidden(regionId: SalesRepLayoutRegionIdType, ids: string[]): void {
    if (editable() && draft.value) {
      draft.value[regionId].hidden = [...ids];
    }
  }

  /**
   * Move a block between its region's halves. `index` is where it was dropped within the half it joins;
   * without one it goes to the end. A block that is already in the destination is not found in the
   * source half, so a redundant call is a no-op rather than a silent relocation.
   */
  function setHidden(id: string, hidden: boolean, index?: number): void {
    if (!draft.value || !editable()) {
      return;
    }

    for (const region of Object.values(draft.value)) {
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

  // `saving`, not just `draft`: the draft is only cleared when the first save resolves, and the
  // breadcrumbs sit outside the pages' `inert` wrapper — so the route guard can reach `save` again
  // mid-flight and fire a second full-document replace.
  async function save(): Promise<boolean> {
    if (!draft.value || saving.value) {
      return false;
    }

    const pending = draft.value;
    const command = serializeLayout(pending, scope, globals.storeId);
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

      // Reconcile from the echo rather than refetching — but only once it accounts for what went out.
      // A short echo is a broken backend, not a rep who arranged nothing, and the write did not error.
      if (echoCoversSentBlocks(saved, command)) {
        savedState.value = reconcileLayout(saved, registry);
      } else {
        Logger.error("[sales-rep] saveSalesRepLayout echoed a document missing blocks that were sent");
        savedState.value = cloneState(pending);
      }

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
    loadFailed,
    saveFailed: readonly(saveFailed),
    visibleIn,
    hiddenIn,
    startEdit,
    cancel,
    reset,
    reorderVisible,
    reorderHidden,
    setHidden,
    save,
  };
}
