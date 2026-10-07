// Scaffolding for the engine's own specs: a synthetic dashboard and an in-memory layout controller, so the
// engine is tested against its contract rather than against one dashboard's tables or one backend's
// operations. A real controller (the sales-rep module's `useSalesRepLayout`) has its own specs.
import { computed, defineComponent, h, readonly, ref } from "vue";
import LayoutWidget from "./components/layout-widget.vue";
import { reconcileLayout } from "./document";
import { getBlockRegistry, registerBlock } from "./registry";
import { statBlocks } from "./stat-cards";
import type { IStatCardDefType } from "./stat-cards";
import type {
  BlockSettingsType,
  LayoutControllerType,
  LayoutRegionIdType,
  LayoutStateType,
  SavedLayoutType,
  StatCardType,
} from "./types";
import type { Ref } from "vue";

export type TestNeedType = "count" | "total" | "people";

/** Four cards over three needs: `beta` shares a need with `alpha` and adds one of its own. */
export const TEST_CARDS = [
  { key: "alpha", labelKey: "test.cards.alpha", icon: "cash", color: "info", needs: ["count"] },
  { key: "beta", labelKey: "test.cards.beta", icon: "cart", color: "success", needs: ["count", "total"] },
  { key: "gamma", labelKey: "test.cards.gamma", icon: "users", color: "neutral", needs: ["people"] },
  { key: "delta", labelKey: "test.cards.delta", icon: "cash", color: "warning", needs: ["total"] },
] as const satisfies readonly IStatCardDefType<TestNeedType>[];

export const TEST_STAT_IDS = TEST_CARDS.map((card) => card.key);

/** What a dashboard's statistics composables would hand the surface for `TEST_CARDS`. */
export const TEST_STAT_CARDS: StatCardType[] = TEST_CARDS.map((card) => ({ ...card, value: "1" }));

/** A widget for specs: a real LayoutWidget, so the controls the engine puts in its header render. */
export const TestWidget = defineComponent({
  props: { title: { type: String, default: undefined } },

  setup(props) {
    return () => h(LayoutWidget, { title: props.title }, { default: () => "body" });
  },
});

export const TEST_MAX_ROWS = { kind: "maxRows", default: 5, min: 1, max: 20 } as const;

/**
 * A complete dashboard: the four stat cards, two widgets in the wide column (`list` is configurable and takes
 * registry props) and two in the rail.
 */
export function registerTestDashboard(scope: string): void {
  for (const block of statBlocks(TEST_CARDS)) {
    registerBlock(scope, block);
  }

  registerBlock(scope, {
    id: "list",
    region: "mainLeft",
    titleKey: "test.blocks.list",
    order: 10,
    component: TestWidget,
    props: { filterable: true },
    settings: [TEST_MAX_ROWS, { kind: "ruleTabs" }],
  });
  registerBlock(scope, {
    id: "notes",
    region: "mainLeft",
    titleKey: "test.blocks.notes",
    order: 20,
    component: TestWidget,
  });
  registerBlock(scope, {
    id: "side",
    region: "mainRight",
    titleKey: "test.blocks.side",
    order: 10,
    component: TestWidget,
  });
  registerBlock(scope, {
    id: "extra",
    region: "mainRight",
    titleKey: "test.blocks.extra",
    order: 20,
    component: TestWidget,
  });
}

const EMPTY_SETTINGS: BlockSettingsType = { hiddenTabs: [] };

/** The contract with its flags writable, so a spec can put the surface into any state. */
export type FakeLayoutType = Omit<LayoutControllerType, "loading" | "saving" | "loadFailed" | "settled"> & {
  loading: Ref<boolean>;
  saving: Ref<boolean>;
  loadFailed: Ref<boolean>;
  settled: Ref<boolean>;
  /** The next `save` fails as a refused write would: the draft and edit mode stay, `saveFailed` turns on. */
  failNextSave: Ref<boolean>;
  /** Every document `save` accepted, in order. */
  savedStates: LayoutStateType[];
};

/**
 * An in-memory controller over the registry: reconciles `saved` (null = never saved), keeps the edit draft,
 * and "persists" a save by adopting the draft. The same rules as a real controller — a draft only while
 * editing, nothing changes mid-save, a failed save keeps the draft.
 */
export function createFakeLayout(scope: string, saved: SavedLayoutType | null = null): FakeLayoutType {
  const loading = ref(false);
  const saving = ref(false);
  const loadFailed = ref(false);
  const saveFailed = ref(false);
  const settled = ref(true);
  const failNextSave = ref(false);
  const savedStates: LayoutStateType[] = [];

  const registry = () => getBlockRegistry(scope);
  const accepted = ref<LayoutStateType | undefined>();
  const draft = ref<LayoutStateType | undefined>();
  const persisted = computed(() => accepted.value ?? reconcileLayout(saved, registry()));
  const state = computed(() => draft.value ?? persisted.value);
  const editing = computed(() => draft.value !== undefined);
  const canEdit = computed(() => !loading.value && !loadFailed.value);

  function editable(): boolean {
    return draft.value !== undefined && !saving.value;
  }

  // Plain data all the way down, so a JSON round trip is a deep copy that drops the reactive proxies.
  const copy = (value: LayoutStateType): LayoutStateType => JSON.parse(JSON.stringify(value)) as LayoutStateType;

  function setHidden(id: string, hidden: boolean, index?: number): void {
    if (!draft.value || !editable()) {
      return;
    }

    for (const region of Object.values(draft.value.regions)) {
      const from = hidden ? region.visible : region.hidden;
      const at = from.indexOf(id);
      if (at !== -1) {
        const to = hidden ? region.hidden : region.visible;
        from.splice(at, 1);
        to.splice(index ?? to.length, 0, id);
        return;
      }
    }
  }

  function reorder(regionId: LayoutRegionIdType, half: "visible" | "hidden", ids: string[]): void {
    if (editable() && draft.value) {
      draft.value.regions[regionId][half] = [...ids];
    }
  }

  async function save(): Promise<boolean> {
    if (!draft.value || saving.value) {
      return false;
    }

    await Promise.resolve();

    if (failNextSave.value) {
      failNextSave.value = false;
      saveFailed.value = true;
      return false;
    }

    accepted.value = copy(draft.value);
    savedStates.push(copy(draft.value));
    draft.value = undefined;
    saveFailed.value = false;
    return true;
  }

  return {
    scope,
    state: readonly(state),
    loading,
    saving,
    editing,
    canEdit,
    loadFailed,
    saveFailed: readonly(saveFailed),
    settled,
    failNextSave,
    savedStates,
    visibleIn: (regionId) => state.value.regions[regionId].visible,
    hiddenIn: (regionId) => state.value.regions[regionId].hidden,
    settingsOf: (blockId) => state.value.settings[blockId] ?? EMPTY_SETTINGS,
    persistedSettingsOf: (blockId) => persisted.value.settings[blockId] ?? EMPTY_SETTINGS,
    updateSettings: (blockId, patch) => {
      if (editable() && draft.value?.settings[blockId]) {
        draft.value.settings[blockId] = { ...draft.value.settings[blockId], ...patch };
      }
    },
    startEdit: () => {
      if (canEdit.value) {
        saveFailed.value = false;
        draft.value = copy(persisted.value);
      }
    },
    cancel: () => {
      draft.value = undefined;
      saveFailed.value = false;
    },
    reset: () => {
      if (editable()) {
        draft.value = reconcileLayout(null, registry());
        saveFailed.value = false;
      }
    },
    reorderVisible: (regionId, ids) => reorder(regionId, "visible", ids),
    reorderHidden: (regionId, ids) => reorder(regionId, "hidden", ids),
    setHidden,
    save,
  };
}
