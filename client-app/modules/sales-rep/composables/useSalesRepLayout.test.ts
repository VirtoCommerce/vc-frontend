import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useSalesRepLayout } from "./useSalesRepLayout";
import type { EffectScope } from "vue";

const apolloMock = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  const result = shallowRef<unknown>(undefined);
  const loading = ref(false);
  const error = ref<Error | undefined>();
  const mutate = vi.fn();
  const refetch = vi.fn();
  // `useMutation`'s own loading flag, which the real one holds true for the duration of the call.
  const saving = ref(false);
  const calls: { query?: unknown[]; mutation?: unknown[] } = {};
  return {
    result,
    loading,
    error,
    mutate,
    refetch,
    saving,
    calls,
    useQuery: vi.fn((...args: unknown[]) => {
      calls.query = args;
      return { result, loading, error, onError: vi.fn(), refetch };
    }),
    useMutation: vi.fn((...args: unknown[]) => {
      calls.mutation = args;
      return { mutate, loading: saving };
    }),
  };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: apolloMock.useQuery,
  useMutation: apolloMock.useMutation,
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

beforeEach(() => {
  apolloMock.result.value = undefined;
  apolloMock.loading.value = false;
  apolloMock.error.value = undefined;
  apolloMock.saving.value = false;
  apolloMock.mutate.mockReset();
  apolloMock.refetch.mockReset();
});

// The composable registers a watchEffect and an onScopeDispose, so each call needs an owning scope: bare
// calls make Vue warn, leave the effect running against shared visibility state, and never let
// clearStatVisibility run — which is also the only way to exercise the publish/clear path.
let scopes: EffectScope[] = [];

function withLayout(layoutScope: Parameters<typeof useSalesRepLayout>[0]) {
  const owner = effectScope();
  scopes.push(owner);
  return owner.run(() => useSalesRepLayout(layoutScope))!;
}

afterEach(() => {
  scopes.forEach((owner) => owner.stop());
  scopes = [];
});

// Row caps the layout sends for the two list widgets. An echo has to return these too, or the save is
// treated as disagreeing — a dropped setting reverts the rep's choice as silently as a reverted hide.
const ECHOED_SETTINGS: Record<string, { key: string; value: unknown }[]> = {
  orders: [{ key: "maxRows", value: 5 }],
  top_sellers: [{ key: "maxRows", value: 5 }],
  search_history: [{ key: "maxRows", value: 5 }],
  browse_history: [{ key: "maxRows", value: 5 }],
};

const echoedBlock = (id: string) => ({ id, type: id, hidden: false, settings: ECHOED_SETTINGS[id] ?? [] });

// The customer profile is the richer surface — it populates all three regions.
const scope = "customerProfile" as const;

// Registry order for this scope; an echo has to cover every sent block to be trusted.
const CUSTOMER_STAT_IDS = ["new_orders", "active_cart", "mtd", "orders_ytd", "aov"];

// The registry defaults, echoed back unchanged — what a well-behaved backend returns for an untouched
// layout. Declared once because a save now only succeeds against an echo that covers every sent block.
const DEFAULT_ECHO = [
  { id: "statistics", blocks: CUSTOMER_STAT_IDS.map(echoedBlock) },
  { id: "mainLeft", blocks: ["orders", "top_sellers"].map(echoedBlock) },
  { id: "mainRight", blocks: ["actions", "info", "search_history", "browse_history"].map(echoedBlock) },
];

/** The default echo with one block's settings replaced — a settings edit needs the echo to agree. */
const echoWithSettings = (id: string, settings: { key: string; value: unknown }[]) =>
  DEFAULT_ECHO.map((region) => ({
    ...region,
    blocks: region.blocks.map((block) => (block.type === id ? { ...block, settings } : block)),
  }));

const sentBlock = (id: string) => {
  const payload = apolloMock.mutate.mock.calls[0][0].command as {
    regions: { blocks: { type: string; settings: { key: string; value: unknown }[] }[] }[];
  };
  return payload.regions.flatMap((region) => region.blocks).find((block) => block.type === id);
};

describe("useSalesRepLayout", () => {
  it("falls back to registry defaults when the rep has never saved this surface", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { state } = withLayout(scope);

    expect(state.value.regions.mainRight.visible).toEqual(["actions", "info", "search_history", "browse_history"]);
    expect(state.value.regions.mainLeft.visible).toEqual(["orders", "top_sellers"]);
  });

  it("applies a saved arrangement over the defaults", () => {
    apolloMock.result.value = {
      salesRepLayout: {
        regions: [
          {
            id: "mainRight",
            blocks: [
              { id: "info", type: "info", hidden: false, settings: [] },
              { id: "actions", type: "actions", hidden: true, settings: [] },
            ],
          },
        ],
      },
    };

    const { state } = withLayout(scope);

    // Blocks the registry gained after the save (the insights widgets) append as visible.
    expect(state.value.regions.mainRight.visible).toEqual(["info", "search_history", "browse_history"]);
    expect(state.value.regions.mainRight.hidden).toEqual(["actions"]);
  });

  it("blocks editing when the read failed, so a full-replace save cannot clobber an unread layout", () => {
    apolloMock.error.value = new Error("boom");

    const { canEdit, startEdit, editing } = withLayout(scope);

    expect(canEdit.value).toBe(false);
    startEdit();
    expect(editing.value).toBe(false);
  });

  // The pages render defaults and drop the edit button when the read fails; without this flag there is
  // nothing to tell the rep why, so it reads as their arrangement having been lost.
  it("reports a failed read so the surface can explain itself", () => {
    apolloMock.error.value = new Error("boom");

    const { loadFailed } = withLayout(scope);

    expect(loadFailed.value).toBe(true);
  });

  it("does not report a failed read for the ordinary never-saved case", () => {
    apolloMock.result.value = { salesRepLayout: null };

    expect(withLayout(scope).loadFailed.value).toBe(false);
  });

  it("allows editing when the query simply returned null", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { canEdit, startEdit, editing } = withLayout(scope);

    expect(canEdit.value).toBe(true);
    startEdit();
    expect(editing.value).toBe(true);
  });

  it("keeps draft edits out of the live layout until saved", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { state, startEdit, setHidden, cancel } = withLayout(scope);
    startEdit();
    setHidden("info", true);

    expect(state.value.regions.mainRight.hidden).toContain("info");

    cancel();
    expect(state.value.regions.mainRight.visible).toContain("info");
  });

  it("sends the complete document — every region, hidden blocks included", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { regions: [] } } });

    const { startEdit, setHidden, save } = withLayout(scope);
    startEdit();
    setHidden("actions", true);

    await save();

    const command = apolloMock.mutate.mock.calls[0][0].command;
    expect(command).toMatchObject({ scope: "customerProfile", storeId: "B2B-store", schemaVersion: 1 });
    expect(command.regions.map((region: { id: string }) => region.id)).toEqual(["statistics", "mainLeft", "mainRight"]);
    const right = command.regions.find((region: { id: string }) => region.id === "mainRight");
    expect(right.blocks.find((block: { type: string }) => block.type === "actions").hidden).toBe(true);
  });

  it("leaves edit mode after a successful save", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    // A faithful echo: an empty one is a mismatch now, which is a refused save rather than a clean one.
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { regions: DEFAULT_ECHO } } });

    const { startEdit, save, editing, saveFailed } = withLayout(scope);
    startEdit();

    await expect(save()).resolves.toBe(true);
    expect(editing.value).toBe(false);
    expect(saveFailed.value).toBe(false);
  });

  it("keeps the draft and stays in edit mode when the save fails", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockRejectedValue(new Error("network"));

    const { startEdit, setHidden, save, editing, state, saveFailed } = withLayout(scope);
    startEdit();
    setHidden("info", true);

    await expect(save()).resolves.toBe(false);
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    expect(state.value.regions.mainRight.hidden).toContain("info");
  });

  // Reconciling a missing document yields registry defaults, so trusting the echo blindly would
  // replace the arrangement with defaults and still report success.
  it("treats a response without a document as a failed save", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: null } });

    const { startEdit, setHidden, save, editing, saveFailed, state } = withLayout(scope);
    startEdit();
    setHidden("info", true);

    await expect(save()).resolves.toBe(false);
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    expect(state.value.regions.mainRight.hidden).toContain("info");
  });

  // No refetch follows a save, so the echo — not what was sent — is what the rep ends up looking at.
  // It has to agree on every `hidden` flag to be trusted, so ORDER is what proves it drives state:
  // `info` before `actions` inverts the order that went out.
  it("reconciles the post-save layout from the echoed document", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({
      data: {
        saveSalesRepLayout: {
          regions: [
            { id: "statistics", blocks: CUSTOMER_STAT_IDS.map(echoedBlock) },
            { id: "mainLeft", blocks: ["orders", "top_sellers"].map(echoedBlock) },
            {
              id: "mainRight",
              blocks: ["info", "actions", "search_history", "browse_history"].map(echoedBlock),
            },
          ],
        },
      },
    });

    const { startEdit, save, state } = withLayout(scope);
    startEdit();
    // Registry order is actions, info — so the echo disagrees with what was sent.
    expect(state.value.regions.mainRight.visible).toEqual(["actions", "info", "search_history", "browse_history"]);

    await expect(save()).resolves.toBe(true);
    expect(state.value.regions.mainRight.visible).toEqual(["info", "actions", "search_history", "browse_history"]);
  });

  // A document is not enough to trust — reconciling a partial one fills the gaps from registry
  // defaults, which silently replaces the rep's arrangement while reporting success.
  it("refuses the save and refetches when the echoed document is missing blocks that were sent", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { regions: [] } } });

    const { startEdit, setHidden, save, state, saveFailed, editing } = withLayout(scope);
    startEdit();
    setHidden("actions", true);

    await expect(save()).resolves.toBe(false);

    // The draft survives, so `actions` stays parked and the rep can retry rather than losing the edit.
    expect(state.value.regions.mainRight.hidden).toContain("actions");
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    // Neither side is trusted; the canonical document is what resolves the disagreement.
    expect(apolloMock.refetch).toHaveBeenCalled();
  });

  // Every type comes back, so a presence-only check passes, but one `hidden` is inverted.
  it("refuses the save when the echo contradicts a hidden flag", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({
      data: {
        saveSalesRepLayout: {
          regions: [
            { id: "statistics", blocks: CUSTOMER_STAT_IDS.map(echoedBlock) },
            { id: "mainLeft", blocks: ["orders", "top_sellers"].map(echoedBlock) },
            // `actions` was sent hidden; the backend echoes it visible.
            { id: "mainRight", blocks: [echoedBlock("info"), echoedBlock("actions")] },
          ],
        },
      },
    });

    const { startEdit, setHidden, save, hiddenIn, saveFailed } = withLayout(scope);
    startEdit();
    setHidden("actions", true);

    await expect(save()).resolves.toBe(false);

    expect(hiddenIn("mainRight")).toEqual(["actions"]);
    expect(saveFailed.value).toBe(true);
    expect(apolloMock.refetch).toHaveBeenCalled();
  });

  // `save` snapshots the payload synchronously and clears the draft when it resolves, so an edit made
  // mid-flight would be written to a document nobody sends and then discarded.
  it("refuses draft edits while a save is in flight", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    let release: (value: unknown) => void = () => {};
    apolloMock.mutate.mockImplementation(() => {
      apolloMock.saving.value = true;
      return new Promise((resolve) => {
        release = (value: unknown) => {
          apolloMock.saving.value = false;
          resolve(value);
        };
      });
    });

    const { startEdit, setHidden, reorderVisible, reset, save, state } = withLayout(scope);
    startEdit();
    setHidden("actions", true);

    const sent = { ...state.value.regions.mainRight };
    const pending = save();

    // Each of these would otherwise land visibly — `reset` most of all, wiping the arrangement to
    // defaults in front of the rep — only to be thrown away when the save resolves.
    reset();
    setHidden("info", true);
    reorderVisible("mainRight", ["info"]);

    expect(state.value.regions.mainRight).toEqual(sent);

    release({
      data: {
        saveSalesRepLayout: {
          regions: [
            { id: "statistics", blocks: CUSTOMER_STAT_IDS.map(echoedBlock) },
            { id: "mainLeft", blocks: ["orders", "top_sellers"].map(echoedBlock) },
            {
              id: "mainRight",
              blocks: [
                echoedBlock("info"),
                { id: "actions", type: "actions", hidden: true, settings: [] },
                echoedBlock("search_history"),
                echoedBlock("browse_history"),
              ],
            },
          ],
        },
      },
    });

    await expect(pending).resolves.toBe(true);
    // The saved arrangement survived; none of the mid-flight calls left a mark.
    expect(state.value.regions.mainRight.visible).toEqual(["info", "search_history", "browse_history"]);
    expect(state.value.regions.mainRight.hidden).toEqual(["actions"]);
  });

  // Settings ride the same draft as the arrangement, so Cancel / Reset / Save cover them with no
  // second state machine. These pin that they actually do.
  it("keeps a settings edit in the draft only, so cancel discards it", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, updateSettings, cancel, settingsOf } = withLayout(scope);
    startEdit();
    updateSettings("orders", { maxRows: 9, hiddenTabs: ["New"] });

    expect(settingsOf("orders")).toMatchObject({ maxRows: 9, hiddenTabs: ["New"] });

    cancel();
    expect(settingsOf("orders")).toMatchObject({ maxRows: 5, hiddenTabs: [] });
  });

  // A row cap is a query variable, so widgets fetch with the saved value and it applies on save.
  it("keeps the saved row cap visible to widgets while the draft holds a different one", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, updateSettings, settingsOf, persistedSettingsOf } = withLayout(scope);
    startEdit();
    updateSettings("orders", { maxRows: 20 });

    expect(settingsOf("orders").maxRows).toBe(20);
    expect(persistedSettingsOf("orders").maxRows).toBe(5);
  });

  it("restores the registry default row cap on reset", () => {
    apolloMock.result.value = {
      salesRepLayout: {
        regions: [
          {
            id: "mainLeft",
            blocks: [{ id: "orders", type: "orders", hidden: false, settings: [{ key: "maxRows", value: 12 }] }],
          },
        ],
      },
    };

    const { startEdit, reset, settingsOf } = withLayout(scope);
    expect(settingsOf("orders").maxRows).toBe(12);

    startEdit();
    reset();
    expect(settingsOf("orders").maxRows).toBe(5);
  });

  it("sends the drafted settings, not the defaults the document was read with", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    const settings = [
      { key: "maxRows", value: 3 },
      { key: "tab.New", value: false },
    ];
    apolloMock.mutate.mockResolvedValue({
      data: { saveSalesRepLayout: { regions: echoWithSettings("orders", settings) } },
    });

    const { startEdit, updateSettings, save, settingsOf } = withLayout(scope);
    startEdit();
    updateSettings("orders", { maxRows: 3, hiddenTabs: ["New"] });

    await expect(save()).resolves.toBe(true);
    expect(sentBlock("orders")?.settings).toEqual(settings);
    // The echo agreed, so the saved state carries the choice rather than reverting to the default.
    expect(settingsOf("orders")).toMatchObject({ maxRows: 3, hiddenTabs: ["New"] });
  });

  it("refuses a settings edit while a save is in flight", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    let release: (value: unknown) => void = () => {};
    apolloMock.mutate.mockImplementation(() => {
      apolloMock.saving.value = true;
      return new Promise((resolve) => {
        release = (value: unknown) => {
          apolloMock.saving.value = false;
          resolve(value);
        };
      });
    });

    const { startEdit, updateSettings, save, settingsOf } = withLayout(scope);
    startEdit();
    const pending = save();

    updateSettings("orders", { maxRows: 17 });
    expect(settingsOf("orders").maxRows).toBe(5);

    release({ data: { saveSalesRepLayout: { regions: DEFAULT_ECHO } } });
    await expect(pending).resolves.toBe(true);
    expect(settingsOf("orders").maxRows).toBe(5);
  });

  // The breadcrumbs sit outside the pages' `inert` wrapper, so the route guard can call `save` again
  // while the first one is still in flight — a second full-document replace of the same document.
  it("refuses a second save while one is in flight", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockImplementation(() => {
      apolloMock.saving.value = true;
      return new Promise(() => {});
    });

    const { startEdit, save } = withLayout(scope);
    startEdit();

    void save();
    await expect(save()).resolves.toBe(false);

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);
  });

  // Otherwise a previous failure's alert sits over a freshly rebuilt draft.
  it("clears a failed-save alert when the draft is reset", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockRejectedValue(new Error("network"));

    const { startEdit, save, reset, saveFailed } = withLayout(scope);
    startEdit();

    await save();
    expect(saveFailed.value).toBe(true);

    reset();
    expect(saveFailed.value).toBe(false);
  });

  // Reordering one half must not disturb the other.
  it("keeps the visible half intact when the hidden half is reordered", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, reorderHidden, visibleIn, hiddenIn } = withLayout(scope);
    startEdit();
    setHidden("info", true);
    setHidden("actions", true);

    reorderHidden("mainRight", ["actions", "info"]);

    expect(hiddenIn("mainRight")).toEqual(["actions", "info"]);
    expect(visibleIn("mainRight")).toEqual(["search_history", "browse_history"]);
    expect(visibleIn("mainLeft")).toEqual(["orders", "top_sellers"]);
  });

  it("reset restores defaults into the draft but does not persist on its own", () => {
    apolloMock.result.value = {
      salesRepLayout: {
        regions: [
          {
            id: "mainRight",
            blocks: [
              { id: "info", type: "info", hidden: false, settings: [] },
              { id: "actions", type: "actions", hidden: false, settings: [] },
            ],
          },
        ],
      },
    };

    const { state, startEdit, reset, cancel } = withLayout(scope);
    startEdit();
    reset();

    expect(state.value.regions.mainRight.visible).toEqual(["actions", "info", "search_history", "browse_history"]);
    expect(apolloMock.mutate).not.toHaveBeenCalled();

    // Cancelling after a reset returns to what is actually stored — both visible, in the saved order,
    // with the blocks the registry gained since (the insights widgets) appended.
    cancel();
    expect(state.value.regions.mainRight.visible).toEqual(["info", "actions", "search_history", "browse_history"]);
    expect(state.value.regions.mainRight.hidden).toEqual([]);
  });

  // The pages render components only for `visibleIn(...)`; the hidden tray renders names alone. A
  // hidden widget therefore never mounts, so it never issues its query — hiding Recent Orders has to
  // mean no salesRepOrders request, not a hidden component quietly fetching.
  it("drops a hidden widget out of the rendered set entirely", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, visibleIn, hiddenIn } = withLayout(scope);
    startEdit();
    setHidden("orders", true);

    expect(visibleIn("mainLeft")).toEqual(["top_sellers"]);
    expect(hiddenIn("mainLeft")).toEqual(["orders"]);
  });

  // A cross-zone drag reports where it was dropped; without it the block lands wherever its old
  // position fell among the other entries.
  it("places a hidden block at the dropped position rather than its old slot", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, hiddenIn } = withLayout(scope);
    startEdit();

    setHidden("info", true);
    setHidden("actions", true, 0);

    expect(hiddenIn("mainRight")).toEqual(["actions", "info"]);
  });

  it("appends to the destination half when no position is given", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, hiddenIn } = withLayout(scope);
    startEdit();

    setHidden("info", true);
    setHidden("actions", true);

    expect(hiddenIn("mainRight")).toEqual(["info", "actions"]);
  });

  it("splits a region into visible and hidden entries", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, visibleIn, hiddenIn } = withLayout(scope);
    startEdit();
    setHidden("actions", true);

    expect(visibleIn("mainRight")).toEqual(["info", "search_history", "browse_history"]);
    expect(hiddenIn("mainRight")).toEqual(["actions"]);
  });

  // The single-array model relocated the block to the end of the half it was already in — a visible
  // "move" from a keypress the rep reads as doing nothing. Two arrays make it unreachable: the block
  // is not in the source half, so there is nothing to move.
  it("ignores a toggle to the state a block is already in", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, visibleIn } = withLayout(scope);
    startEdit();
    const before = [...visibleIn("mainRight")];

    setHidden(before[0], false, 1);

    expect(visibleIn("mainRight")).toEqual(before);
  });

  it("lets a parked block come back after the visible half has been reordered", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, reorderVisible, visibleIn, hiddenIn } = withLayout(scope);
    startEdit();
    setHidden("actions", true);

    reorderVisible("mainRight", [...visibleIn("mainRight")]);

    setHidden("actions", false);

    expect(hiddenIn("mainRight")).toEqual([]);
    expect(visibleIn("mainRight")).toEqual(["info", "search_history", "browse_history", "actions"]);
  });

  // Nothing else observes the collision, so the fetch policy itself is the assertion.
  it("skips the Apollo cache, which would share region entities between the two surfaces", () => {
    apolloMock.result.value = { salesRepLayout: null };

    withLayout(scope);

    expect(apolloMock.calls.query?.[2]).toMatchObject({ fetchPolicy: "no-cache" });
    expect(apolloMock.calls.mutation?.[1]).toMatchObject({ fetchPolicy: "no-cache" });
  });

  // `refetch` flips the query's loading flag, and the pages swap the whole surface for the skeleton
  // while it is true — which mid-edit would unmount the edit bar and the draft's focus with it.
  it("does not blank the surface while it refetches after a disagreeing echo", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { regions: [] } } });
    apolloMock.refetch.mockImplementation(() => {
      apolloMock.loading.value = true;
      return Promise.resolve();
    });

    const { startEdit, save, loading, editing } = withLayout(scope);
    startEdit();

    await expect(save()).resolves.toBe(false);

    expect(loading.value).toBe(false);
    expect(editing.value).toBe(true);
  });

  // The refetch is fire-and-forget, so a rejection has to be caught or it surfaces as an unhandled one.
  it("survives a refetch that fails", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { regions: [] } } });
    apolloMock.refetch.mockRejectedValue(new Error("offline"));

    const { startEdit, save, saveFailed } = withLayout(scope);
    startEdit();

    await expect(save()).resolves.toBe(false);
    expect(saveFailed.value).toBe(true);
  });
});
