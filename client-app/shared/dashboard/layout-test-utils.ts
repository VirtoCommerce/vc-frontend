// Scaffolding for the engine's own specs: a synthetic dashboard, and the real layout controller
// (`createLayoutController`) over in-memory storage — so the engine is tested against its contract rather than
// against one dashboard's tables or one backend's operations, and every spec drives the one state machine all
// dashboards run. `useLayout`, which binds the same controller to the backend, has its own spec.
import { defineComponent, h, ref } from "vue";
import LayoutWidget from "./components/layout-widget.vue";
import { createLayoutController } from "./composables/useLayout";
import { getBlockRegistry, registerBlock } from "./registry";
import { statBlocks } from "./stat-cards";
import type { IStatCardDefType } from "./stat-cards";
import type { LayoutControllerType, LayoutInputType, SavedLayoutType, StatCardType } from "./types";
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

export type FakeLayoutOptionsType = {
  /** The stored document; `null`, the default, is a user who never saved this dashboard. */
  saved?: SavedLayoutType | null;
  /** How the read goes: `pending` never lands, which holds the surface at its skeleton; `failed` is refused. */
  read?: "loaded" | "pending" | "failed";
};

/** The real controller, plus what a spec needs to put a save into a given state. */
export type FakeLayoutType = LayoutControllerType & {
  /** The next save is refused, as a failed write would be: the draft and edit mode stay, `saveFailed` turns on. */
  failNextSave: Ref<boolean>;
  /** Holds the next save in flight until the returned function is called — the window a save locks the draft. */
  holdNextSave: () => () => void;
};

/**
 * `createLayoutController` over an in-memory document: the read resolves on the next microtask (so a spec awaits
 * `flushPromises()` before editing, as a page waits for its read), and a save stores the command as sent, so its echo
 * always agrees.
 */
export function createFakeLayout(scope: string, options: FakeLayoutOptionsType = {}): FakeLayoutType {
  const { read = "loaded" } = options;
  let stored = options.saved ?? null;
  let held: Promise<void> | undefined;
  const failNextSave = ref(false);

  function load(): Promise<SavedLayoutType | null> {
    if (read === "pending") {
      return new Promise(() => {});
    }
    if (read === "failed") {
      return Promise.reject(new Error("The layout could not be read."));
    }
    return Promise.resolve(stored);
  }

  async function save(command: LayoutInputType): Promise<SavedLayoutType> {
    const gate = held;
    held = undefined;
    await gate;

    if (failNextSave.value) {
      failNextSave.value = false;
      throw new Error("The layout could not be saved.");
    }

    stored = { regions: command.regions };
    return stored;
  }

  function holdNextSave(): () => void {
    let release = () => {};
    held = new Promise((resolve) => {
      release = resolve;
    });
    return release;
  }

  const layout = createLayoutController({ scope, load, save, defaults: () => getBlockRegistry(scope) });

  return { ...layout, failNextSave, holdNextSave };
}
