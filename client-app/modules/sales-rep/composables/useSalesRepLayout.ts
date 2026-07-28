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

  /**
   * Reorder within a region. Blocks never move between regions — region is owned by the registry.
   *
   * Entries are copied, not stored as given: callers stitch this array out of `state`, which is
   * exported `readonly()`, so a deep-readonly entry stored here would make the draft partly frozen
   * and `setHidden`'s in-place write would fail silently in production.
   */
  function reorder(regionId: SalesRepLayoutRegionIdType, entries: SalesRepLayoutEntryType[]): void {
    if (draft.value) {
      draft.value[regionId] = entries.map((entry) => ({ id: entry.id, hidden: entry.hidden }));
    }
  }

  /**
   * Hide or restore a block. `index` places it within the half it moves into, so a cross-zone drag
   * lands where the rep dropped it instead of wherever its old position happened to fall among the
   * other entries; without one the block goes to the end of that half.
   */
  function setHidden(id: string, hidden: boolean, index?: number): void {
    const regions = draft.value;
    if (!regions) {
      return;
    }

    const regionId = (Object.keys(regions) as SalesRepLayoutRegionIdType[]).find((candidate) =>
      regions[candidate].some((entry) => entry.id === id),
    );
    if (!regionId) {
      return;
    }

    const rest = regions[regionId].filter((entry) => entry.id !== id);
    const destination = rest.filter((entry) => entry.hidden === hidden);
    const opposite = rest.filter((entry) => entry.hidden !== hidden);

    destination.splice(index ?? destination.length, 0, { id, hidden });

    // Visible first, then hidden — the order the reorder stitchers already produce.
    regions[regionId] = hidden ? [...opposite, ...destination] : [...destination, ...opposite];
  }

  async function save(): Promise<boolean> {
    if (!draft.value) {
      return false;
    }

    const pending = draft.value;
    try {
      const response = await mutate({ command: serializeLayout(pending, scope, globals.storeId) });
      const saved = response?.data?.saveSalesRepLayout;

      // Without a document there is nothing to trust: reconciling `undefined` yields registry
      // defaults, which would silently replace the rep's arrangement and report success.
      if (!saved) {
        Logger.error("[sales-rep] saveSalesRepLayout returned no document");
        saveFailed.value = true;
        return false;
      }

      // The mutation echoes the stored document, so reconcile from it rather than refetching.
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
