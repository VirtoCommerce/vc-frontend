import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepLayout } from "./useSalesRepLayout";

const apolloMock = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  const result = shallowRef<unknown>(undefined);
  const loading = ref(false);
  const error = ref<Error | undefined>();
  const mutate = vi.fn();
  return {
    result,
    loading,
    error,
    mutate,
    useQuery: vi.fn(() => ({ result, loading, error, onError: vi.fn() })),
    useMutation: vi.fn(() => ({ mutate, loading: ref(false) })),
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
  apolloMock.mutate.mockReset();
});

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

  it("splits a region into visible and hidden entries", () => {
    apolloMock.result.value = { salesRepLayout: null };

    const { startEdit, setHidden, visibleIn, hiddenIn } = useSalesRepLayout(scope);
    startEdit();
    setHidden("actions", true);

    expect(visibleIn("mainRight").map((entry) => entry.id)).toEqual(["info"]);
    expect(hiddenIn("mainRight").map((entry) => entry.id)).toEqual(["actions"]);
  });
});
