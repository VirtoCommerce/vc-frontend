import { computed, readonly, ref, shallowRef } from "vue";
// Subpaths, not the `account` barrel: this file is a facade export (client-app/core-api), and a barrel would drag
// every account operation into its graph.
import { saveLayout } from "@/core/api/graphql/account/mutations/saveLayout";
import { getLayout } from "@/core/api/graphql/account/queries/getLayout";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { echoMatchesSentBlocks, reconcileLayout, serializeLayout } from "../document";
import { getBlockRegistry } from "../registry";
import type {
  BlockSettingsType,
  LayoutControllerOptionsType,
  LayoutControllerType,
  LayoutRegionIdType,
  LayoutStateType,
  SavedLayoutType,
} from "../types";

const EMPTY_SETTINGS: BlockSettingsType = { hiddenTabs: [] };

function cloneState(state: LayoutStateType): LayoutStateType {
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
 * One dashboard's layout over whatever stores it: `load` reads the saved document (at once), `save` replaces it, and
 * `defaults` names the blocks it is reconciled against. `startEdit` snapshots into a draft, every change targets the
 * draft, and `save` writes the whole document in one call — the backend replaces, not merges. `reset` refills the
 * draft from the defaults but still needs a save, so a stray click is recoverable. `restoreDefaults` is the one write
 * that skips the draft: the empty state's button saves the defaults at once.
 */
export function createLayoutController(options: LayoutControllerOptionsType): LayoutControllerType {
  const { scope, storeId, defaults } = options;

  // `undefined` until the first read lands; `null` is the never-saved case.
  const loaded = shallowRef<SavedLayoutType | null>();
  const reading = ref(false);
  const readFailed = ref(false);
  // What the last save stored, reconciled. It outranks `loaded` until a re-read clears it.
  const savedState = ref<LayoutStateType>();
  const draft = ref<LayoutStateType>();
  const saving = ref(false);
  const saveFailed = ref(false);

  // The layout as last persisted, or the defaults when the user never saved this dashboard.
  const persisted = computed(() => savedState.value ?? reconcileLayout(loaded.value, defaults()));
  const state = computed(() => draft.value ?? persisted.value);
  const editing = computed(() => draft.value !== undefined);

  // Only a read with nothing to show yet blanks the surface. The re-read after a disagreeing echo runs mid-edit, and
  // swapping a live layout for the skeleton would unmount the edit bar and take focus with it.
  const loading = computed(() => reading.value && loaded.value === undefined && !savedState.value);

  // A save replaces the whole document, so a layout that could not be read must not be editable — saving would
  // overwrite an arrangement nobody could see. The never-saved case (`null`) stays editable.
  const canEdit = computed(() => !reading.value && !readFailed.value);

  // Settled = the document has been read, or the read failed and the defaults are final. Either way the visible set
  // is now the real one, which is what the statistics queries wait for (`useStatDataNeeds`). A failed read keeps the
  // cards fed rather than leaving them empty behind the alert.
  const settled = computed(() => loaded.value !== undefined || Boolean(savedState.value) || readFailed.value);

  // Nothing waits for a read: what it ends in is state — `loaded`, or `readFailed` — not a promise to handle.
  function read(): void {
    reading.value = true;

    options
      .load()
      .then((saved) => {
        loaded.value = saved ?? null;
        readFailed.value = false;
      })
      .catch((error: unknown) => {
        Logger.error(`[layout] the "${scope}" layout could not be read:`, error);
        readFailed.value = true;
      })
      .finally(() => {
        reading.value = false;
      });
  }

  function visibleIn(regionId: LayoutRegionIdType): readonly string[] {
    return state.value.regions[regionId].visible;
  }

  function hiddenIn(regionId: LayoutRegionIdType): readonly string[] {
    return state.value.regions[regionId].hidden;
  }

  /** A block with no declared settings has none — the shared empty keeps callers from branching. */
  function settingsOf(blockId: string): BlockSettingsType {
    return state.value.settings[blockId] ?? EMPTY_SETTINGS;
  }

  /** The saved value, ignoring any draft: a row cap is a query variable, so it applies on save rather than
   * refiring the query per keystroke. */
  function persistedSettingsOf(blockId: string): BlockSettingsType {
    return persisted.value.settings[blockId] ?? EMPTY_SETTINGS;
  }

  // `save` snapshots the payload synchronously and clears the draft when it resolves, so an edit made mid-flight
  // would land in a document nobody sends and then be discarded. The surface's `inert` covers the UI; this covers
  // the programmatic paths an attribute cannot.
  function editable(): boolean {
    return draft.value !== undefined && !saving.value;
  }

  function updateSettings(blockId: string, patch: Partial<BlockSettingsType>): void {
    // Only a block the registry declared settings for: an unknown id would create an entry `serializeSettings`
    // then drops, so the user would see a change that never persists.
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

  function reset(): void {
    if (editable()) {
      draft.value = reconcileLayout(null, defaults());
      // Otherwise a previous failure's alert sits over a freshly rebuilt draft.
      saveFailed.value = false;
    }
  }

  // Ids are copied, not stored as given: callers read them out of `state`, which is exported `readonly()`, and Vue's
  // readonly arrays are not assignable to a mutable draft.
  function reorderVisible(regionId: LayoutRegionIdType, ids: string[]): void {
    if (editable() && draft.value) {
      draft.value.regions[regionId].visible = [...ids];
    }
  }

  function reorderHidden(regionId: LayoutRegionIdType, ids: string[]): void {
    if (editable() && draft.value) {
      draft.value.regions[regionId].hidden = [...ids];
    }
  }

  /**
   * Move a block between its region's halves. `index` is where it was dropped, else the end. A block already in the
   * destination is not in the source half, so a redundant call is a no-op.
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

  /**
   * Writes `pending` as the whole document. Success adopts the echo and ends edit mode; failure leaves the draft
   * alone. Neither outcome touches `saveFailed`: each caller decides where the user lands.
   */
  async function persist(pending: LayoutStateType): Promise<boolean> {
    const command = serializeLayout(pending, scope, defaults(), storeId);
    saving.value = true;

    try {
      const stored = await options.save(command);

      // Without a document there is nothing to trust: reconciling nothing yields the defaults, which would silently
      // replace the user's arrangement and report success.
      if (!stored) {
        Logger.error(`[layout] saving the "${scope}" layout returned no document`);
        return false;
      }

      // A contradictory echo means neither side can be trusted: adopting it would revert the user's hides, and
      // adopting the draft would make a document the backend never stored look canonical with no later read to
      // correct it. So the stored document is read again, and the failure is one the user can retry.
      if (!echoMatchesSentBlocks(stored, command)) {
        Logger.error(`[layout] saving the "${scope}" layout echoed a document that disagrees with what was sent`);
        // Cleared so `persisted` reads the re-read rather than a stale echo.
        savedState.value = undefined;
        read();
        return false;
      }

      savedState.value = reconcileLayout(stored, defaults());
      draft.value = undefined;
      return true;
    } catch (error) {
      Logger.error(`[layout] the "${scope}" layout could not be saved:`, error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  // `saving`, not just `draft`: the draft is only cleared once the first save resolves, so anything holding a
  // reference could otherwise fire a second full-document replace mid-flight.
  async function save(): Promise<boolean> {
    if (!draft.value || saving.value) {
      return false;
    }

    // A failure keeps edit mode and the draft — the user's arrangement is not thrown away on a failed write.
    const saved = await persist(draft.value);
    saveFailed.value = !saved;
    return saved;
  }

  /**
   * The empty state's one-click way back: the defaults are written straight away, with no edit mode in between. A
   * failed write lands in edit mode on those defaults, so Save in the edit bar retries it.
   */
  async function restoreDefaults(): Promise<boolean> {
    if (!canEdit.value || draft.value || saving.value) {
      return false;
    }

    const defaultState = reconcileLayout(null, defaults());
    const saved = await persist(defaultState);
    if (!saved) {
      // Draft first: edit mode's entry announcement must come before the failure's, not over it.
      draft.value = defaultState;
    }
    saveFailed.value = !saved;
    return saved;
  }

  read();

  return {
    scope,
    state: readonly(state),
    loading,
    saving: readonly(saving),
    editing,
    canEdit,
    loadFailed: readonly(readFailed),
    saveFailed: readonly(saveFailed),
    settled,
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
    restoreDefaults,
  };
}

/**
 * The signed-in user's layout of one dashboard, as the backend stores it: `createLayoutController` over the `layout`
 * and `saveLayout` operations, for the current store, reconciled against the blocks registered under `scope`. The
 * page creates it and hands it to `<LayoutSurface :layout>`.
 */
export function useLayout(scope: string): LayoutControllerType {
  const { storeId } = globals;

  return createLayoutController({
    scope,
    storeId,
    load: () => getLayout({ scope, storeId }),
    save: saveLayout,
    // Read where it is used rather than captured once: the registry is reactive, so a block registered after this
    // ran still reaches the reconciled layout.
    defaults: () => getBlockRegistry(scope),
  });
}
