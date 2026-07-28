import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepLayout } from "./useSalesRepLayout";

const apolloMock = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  const result = shallowRef<unknown>(undefined);
  const loading = ref(false);
  const error = ref<Error | undefined>();
  const mutate = vi.fn();
  // `useMutation`'s own loading flag, which the real one holds true for the duration of the call.
  const saving = ref(false);
  const calls: { query?: unknown[]; mutation?: unknown[] } = {};
  return {
    result,
    loading,
    error,
    mutate,
    saving,
    calls,
    useQuery: vi.fn((...args: unknown[]) => {
      calls.query = args;
      return { result, loading, error, onError: vi.fn() };
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
});

const echoedBlock = (id: string) => ({ id, type: id, hidden: false, settings: [] });

// The customer profile is the richer surface — it populates all three regions.
const scope = "customerProfile" as const;

describe("useSalesRepLayout", () => {
  it("falls back to registry defaults when the rep has never saved this surface", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { state } = useSalesRepLayout(scope);

    expect(state.value.mainRight.map((entry) => entry.id)).toEqual(["actions", "info"]);
    expect(state.value.mainLeft.map((entry) => entry.id)).toEqual(["orders"]);
  });

  it("applies a saved arrangement over the defaults", () => {
    apolloMock.result.value = {
      salesRepLayout: {
        schemaVersion: 1,
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

    const { state } = useSalesRepLayout(scope);

    expect(state.value.mainRight.map((entry) => entry.id)).toEqual(["info", "actions"]);
    expect(state.value.mainRight[1].hidden).toBe(true);
  });

  it("blocks editing when the read failed, so a full-replace save cannot clobber an unread layout", () => {
    apolloMock.error.value = new Error("boom");

    const { canEdit, startEdit, editing } = useSalesRepLayout(scope);

    expect(canEdit.value).toBe(false);
    startEdit();
    expect(editing.value).toBe(false);
  });

  it("allows editing when the query simply returned null", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { canEdit, startEdit, editing } = useSalesRepLayout(scope);

    expect(canEdit.value).toBe(true);
    startEdit();
    expect(editing.value).toBe(true);
  });

  it("keeps draft edits out of the live layout until saved", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { state, startEdit, setHidden, cancel } = useSalesRepLayout(scope);
    startEdit();
    setHidden("info", true);

    expect(state.value.mainRight.find((entry) => entry.id === "info")?.hidden).toBe(true);

    cancel();
    expect(state.value.mainRight.find((entry) => entry.id === "info")?.hidden).toBe(false);
  });

  it("sends the complete document — every region, hidden blocks included", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { schemaVersion: 1, regions: [] } } });

    const { startEdit, setHidden, save } = useSalesRepLayout(scope);
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
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { schemaVersion: 1, regions: [] } } });

    const { startEdit, save, editing, saveFailed } = useSalesRepLayout(scope);
    startEdit();

    await expect(save()).resolves.toBe(true);
    expect(editing.value).toBe(false);
    expect(saveFailed.value).toBe(false);
  });

  it("keeps the draft and stays in edit mode when the save fails", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockRejectedValue(new Error("network"));

    const { startEdit, setHidden, save, editing, state, saveFailed } = useSalesRepLayout(scope);
    startEdit();
    setHidden("info", true);

    await expect(save()).resolves.toBe(false);
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    expect(state.value.mainRight.find((entry) => entry.id === "info")?.hidden).toBe(true);
  });

  // Reconciling a missing document yields registry defaults, so trusting the echo blindly would
  // replace the arrangement with defaults and still report success.
  it("treats a response without a document as a failed save", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: null } });

    const { startEdit, setHidden, save, editing, saveFailed, state } = useSalesRepLayout(scope);
    startEdit();
    setHidden("info", true);

    await expect(save()).resolves.toBe(false);
    expect(editing.value).toBe(true);
    expect(saveFailed.value).toBe(true);
    expect(state.value.mainRight.find((entry) => entry.id === "info")?.hidden).toBe(true);
  });

  // The mutation echoes the stored document and no refetch follows, so the echo — not what was sent —
  // is what the rep ends up looking at.
  // The echo is complete on purpose: a document missing blocks that were sent is not trusted, and
  // this test is about the echo DRIVING state — `info` before `actions` inverts the registry order.
  it("reconciles the post-save layout from the echoed document", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({
      data: {
        saveSalesRepLayout: {
          schemaVersion: 1,
          regions: [
            { id: "statistics", blocks: ["ytd", "open_balance", "aov", "orders_ytd"].map(echoedBlock) },
            { id: "mainLeft", blocks: [echoedBlock("orders")] },
            {
              id: "mainRight",
              blocks: [echoedBlock("info"), { id: "actions", type: "actions", hidden: true, settings: [] }],
            },
          ],
        },
      },
    });

    const { startEdit, save, state } = useSalesRepLayout(scope);
    startEdit();

    await expect(save()).resolves.toBe(true);
    expect(state.value.mainRight.map((entry) => entry.id)).toEqual(["info", "actions"]);
    expect(state.value.mainRight[1].hidden).toBe(true);
  });

  // A document is not enough to trust — reconciling a partial one fills the gaps from registry
  // defaults, which silently replaces the rep's arrangement while reporting success.
  it("keeps the rep's arrangement when the echoed document is missing blocks that were sent", async () => {
    apolloMock.result.value = { salesRepLayout: null };
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { schemaVersion: 1, regions: [] } } });

    const { startEdit, setHidden, save, state, saveFailed } = useSalesRepLayout(scope);
    startEdit();
    setHidden("actions", true);

    await expect(save()).resolves.toBe(true);

    // Not defaults: `actions` stays parked, exactly as it was arranged.
    expect(state.value.mainRight.find((entry) => entry.id === "actions")?.hidden).toBe(true);
    expect(saveFailed.value).toBe(false);
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

    const { startEdit, setHidden, reorder, reset, save, state } = useSalesRepLayout(scope);
    startEdit();
    setHidden("actions", true);

    const sent = state.value.mainRight.map((entry) => `${entry.id}:${entry.hidden}`);
    const pending = save();

    // Each of these would otherwise land visibly — `reset` most of all, wiping the arrangement to
    // defaults in front of the rep — only to be thrown away when the save resolves.
    reset();
    setHidden("info", true);
    reorder("mainRight", [{ id: "info", hidden: false }]);

    expect(state.value.mainRight.map((entry) => `${entry.id}:${entry.hidden}`)).toEqual(sent);

    release({
      data: {
        saveSalesRepLayout: {
          schemaVersion: 1,
          regions: [
            { id: "statistics", blocks: ["ytd", "open_balance", "aov", "orders_ytd"].map(echoedBlock) },
            { id: "mainLeft", blocks: [echoedBlock("orders")] },
            {
              id: "mainRight",
              blocks: [echoedBlock("info"), { id: "actions", type: "actions", hidden: true, settings: [] }],
            },
          ],
        },
      },
    });

    await expect(pending).resolves.toBe(true);
    // The saved arrangement survived; none of the mid-flight calls left a mark.
    expect(state.value.mainRight.find((entry) => entry.id === "actions")?.hidden).toBe(true);
    expect(state.value.mainRight.map((entry) => entry.id)).toEqual(["info", "actions"]);
  });

  // Mirrors the pages' `reorderHidden`: the hidden strip is reordered and stitched back after the
  // visible half, which must leave the visible order untouched.
  it("keeps the visible half intact when the hidden half is reordered", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { state, startEdit, setHidden, reorder, visibleIn, hiddenIn } = useSalesRepLayout(scope);
    startEdit();
    setHidden("info", true);
    setHidden("actions", true);

    reorder("mainRight", [
      ...state.value.mainRight.filter((entry) => !entry.hidden),
      ...["actions", "info"].map((id) => ({ id, hidden: true })),
    ]);

    expect(hiddenIn("mainRight").map((entry) => entry.id)).toEqual(["actions", "info"]);
    expect(visibleIn("mainRight")).toEqual([]);
    expect(visibleIn("mainLeft").map((entry) => entry.id)).toEqual(["orders"]);
  });

  it("reset restores defaults into the draft but does not persist on its own", () => {
    apolloMock.result.value = {
      salesRepLayout: {
        schemaVersion: 1,
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

    const { state, startEdit, reset, cancel } = useSalesRepLayout(scope);
    startEdit();
    reset();

    expect(state.value.mainRight.map((entry) => entry.id)).toEqual(["actions", "info"]);
    expect(apolloMock.mutate).not.toHaveBeenCalled();

    // Cancelling after a reset returns to what is actually stored.
    cancel();
    expect(state.value.mainRight.map((entry) => entry.id)).toEqual(["info", "actions"]);
  });

  // The pages render components only for `visibleIn(...)`; the hidden tray renders names alone. A
  // hidden widget therefore never mounts, so it never issues its query — hiding Recent Orders has to
  // mean no salesRepOrders request, not a hidden component quietly fetching.
  it("drops a hidden widget out of the rendered set entirely", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, visibleIn, hiddenIn } = useSalesRepLayout(scope);
    startEdit();
    setHidden("orders", true);

    expect(visibleIn("mainLeft")).toEqual([]);
    expect(hiddenIn("mainLeft").map((entry) => entry.id)).toEqual(["orders"]);
  });

  // A cross-zone drag reports where it was dropped; without it the block lands wherever its old
  // position fell among the other entries.
  it("places a hidden block at the dropped position rather than its old slot", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, hiddenIn } = useSalesRepLayout(scope);
    startEdit();

    setHidden("info", true);
    setHidden("actions", true, 0);

    expect(hiddenIn("mainRight").map((entry) => entry.id)).toEqual(["actions", "info"]);
  });

  it("appends to the destination half when no position is given", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, hiddenIn } = useSalesRepLayout(scope);
    startEdit();

    setHidden("info", true);
    setHidden("actions", true);

    expect(hiddenIn("mainRight").map((entry) => entry.id)).toEqual(["info", "actions"]);
  });

  it("splits a region into visible and hidden entries", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, visibleIn, hiddenIn } = useSalesRepLayout(scope);
    startEdit();
    setHidden("actions", true);

    expect(visibleIn("mainRight").map((entry) => entry.id)).toEqual(["info"]);
    expect(hiddenIn("mainRight").map((entry) => entry.id)).toEqual(["actions"]);
  });

  // Types cannot catch this: `DeepReadonly<{ id, hidden }>` is assignable to `{ id, hidden }`.
  it("keeps a reordered region writable, so its hidden blocks can still be restored", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { state, startEdit, setHidden, reorder, visibleIn, hiddenIn } = useSalesRepLayout(scope);
    startEdit();
    setHidden("actions", true);

    // Exactly what the pages' `reorderVisible` does.
    reorder("mainRight", [
      ...visibleIn("mainRight").map((entry) => ({ id: entry.id, hidden: false })),
      ...state.value.mainRight.filter((entry) => entry.hidden),
    ]);

    setHidden("actions", false);

    expect(hiddenIn("mainRight")).toEqual([]);
    expect(visibleIn("mainRight").map((entry) => entry.id)).toEqual(["info", "actions"]);
  });

  // Nothing else observes the collision, so the fetch policy itself is the assertion.
  it("skips the Apollo cache, which would share region entities between the two surfaces", () => {
    apolloMock.result.value = { salesRepLayout: null };

    useSalesRepLayout(scope);

    expect(apolloMock.calls.query?.[2]).toMatchObject({ fetchPolicy: "no-cache" });
    expect(apolloMock.calls.mutation?.[1]).toMatchObject({ fetchPolicy: "no-cache" });
  });
});
