import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { useLayoutPage } from "./useLayoutPage";
import type { EffectScope } from "vue";

const apolloMock = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  return {
    result: shallowRef<unknown>(undefined),
    loading: ref(false),
    error: ref<Error | undefined>(),
    mutate: vi.fn(),
    saving: ref(false),
  };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({
    result: apolloMock.result,
    loading: apolloMock.loading,
    error: apolloMock.error,
    onError: vi.fn(),
    refetch: vi.fn(),
  }),
  useMutation: () => ({ mutate: apolloMock.mutate, loading: apolloMock.saving }),
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

// The two list widgets send a row cap, and a save only succeeds against an echo that returns it.
const ECHOED_SETTINGS: Record<string, { key: string; value: unknown }[]> = {
  orders: [{ key: "maxRows", value: 5 }],
  top_sellers: [{ key: "maxRows", value: 5 }],
};

const echoedBlock = (id: string) => ({ id, type: id, hidden: false, settings: ECHOED_SETTINGS[id] ?? [] });

beforeEach(() => {
  apolloMock.result.value = { salesRepLayout: null };
  apolloMock.error.value = undefined;
  apolloMock.saving.value = false;
  apolloMock.mutate.mockReset();
});

// useLayoutPage wraps useSalesRepLayout, which registers a watchEffect and an onScopeDispose — so these
// calls need an owning scope too, or the effects outlive the test against shared visibility state.
let scopes: EffectScope[] = [];

function withPage(scope: Parameters<typeof useLayoutPage>[0]) {
  const owner = effectScope();
  scopes.push(owner);
  return owner.run(() => useLayoutPage(scope))!;
}

afterEach(() => {
  scopes.forEach((owner) => owner.stop());
  scopes = [];
  document.body.replaceChildren();
});

// The edit bar and the toggle are never mounted together, which is the whole reason focus has to be
// handed between them; a test needs both present to prove the right one is chosen.
function renderChrome(): void {
  const save = document.createElement("button");
  save.dataset.layoutSave = "";
  const toggle = document.createElement("button");
  toggle.dataset.layoutEditToggle = "";
  document.body.append(save, toggle);
}

const activeMarker = () =>
  document.activeElement instanceof HTMLElement ? Object.keys(document.activeElement.dataset)[0] : undefined;

describe("useLayoutPage", () => {
  // Starting a save makes the wrapper inert, dropping focus to <body>. On success edit mode ends and
  // the toggle reclaims it; a failure keeps the bar mounted, so nothing else would.
  it("returns focus to Save when a save fails", async () => {
    apolloMock.mutate.mockRejectedValue(new Error("network"));
    renderChrome();

    const { startEdit, save, editing } = withPage("customerProfile");
    startEdit();

    await save();
    await nextTick();
    await nextTick();

    expect(editing.value).toBe(true);
    expect(activeMarker()).toBe("layoutSave");
  });

  it("returns focus to the edit toggle when edit mode ends", async () => {
    // A faithful echo: a short one is a refused save, which keeps edit mode and Save's focus.
    apolloMock.mutate.mockResolvedValue({
      data: {
        saveSalesRepLayout: {
          regions: [
            { id: "statistics", blocks: ["new_orders", "active_cart", "mtd", "orders_ytd", "aov"].map(echoedBlock) },
            { id: "mainLeft", blocks: ["orders", "top_sellers"].map(echoedBlock) },
            { id: "mainRight", blocks: ["actions", "info"].map(echoedBlock) },
          ],
        },
      },
    });
    renderChrome();

    const { startEdit, save } = withPage("customerProfile");
    startEdit();

    await save();
    await nextTick();
    await nextTick();

    expect(activeMarker()).toBe("layoutEditToggle");
  });

  // Nothing else tells a screen reader the surface changed, or that the arrow keys do anything.
  it("announces edit mode and the keyboard gesture on entry", async () => {
    const { startEdit, message } = withPage("customerProfile");

    startEdit();
    await nextTick();

    expect(message.value).toContain("sales_rep.hub.layout.editing");
    expect(message.value).toContain("sales_rep.hub.layout.hint_keyboard");
  });

  // Both widget columns share one tray, so a page reads them as a single list.
  it("gathers hidden widgets from both columns", () => {
    const { startEdit, toggleHidden, hiddenWidgets } = withPage("customerProfile");
    startEdit();

    toggleHidden("orders", true);
    toggleHidden("info", true);

    expect(hiddenWidgets.value).toEqual(["orders", "info"]);
  });

  // The registry is the only place a block's props are declared, and the pages bind them blind. A
  // widget silently losing `filterable` drops the orders filter chips with nothing failing.
  it("hands a block its registry props, and an empty object when it has none", () => {
    const { propsOf } = withPage("dashboard");

    expect(propsOf("orders")).toEqual({ filterable: true });
    expect(propsOf("top_sellers")).toEqual({});
    // Stat blocks declare no `props` at all, and an unknown id must not throw.
    expect(propsOf("new_orders")).toEqual({});
    expect(propsOf("nonexistent")).toEqual({});
  });
});

describe("useLayoutPage with every block hidden", () => {
  const hiddenBlock = (id: string) => ({ ...echoedBlock(id), hidden: true });

  const documentOf = (toBlock: (id: string) => ReturnType<typeof echoedBlock>) => ({
    regions: [
      { id: "statistics", blocks: ["new_orders", "active_cart", "mtd", "orders_ytd", "aov"].map(toBlock) },
      { id: "mainLeft", blocks: ["orders", "top_sellers"].map(toBlock) },
      { id: "mainRight", blocks: ["actions", "info"].map(toBlock) },
    ],
  });

  beforeEach(() => {
    apolloMock.result.value = { salesRepLayout: documentOf(hiddenBlock) };
  });

  // In edit mode the empty zones and the tray are the way back, so the empty state would only cover them.
  it("reports the surface empty outside edit mode only", () => {
    const { allHidden, startEdit } = withPage("customerProfile");
    expect(allHidden.value).toBe(true);

    startEdit();
    expect(allHidden.value).toBe(false);
  });

  it("does not report a surface that still shows one block", () => {
    apolloMock.result.value = {
      salesRepLayout: documentOf((id) => (id === "info" ? echoedBlock(id) : hiddenBlock(id))),
    };

    const { allHidden } = withPage("customerProfile");
    expect(allHidden.value).toBe(false);
  });

  // The empty state unmounts with the clicked button in it, so focus would otherwise drop to <body>.
  it("announces a restore that saved and hands focus to the edit toggle", async () => {
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: documentOf(echoedBlock) } });
    renderChrome();

    const { restoreDefaults, allHidden, message } = withPage("customerProfile");

    await restoreDefaults();
    await nextTick();
    await nextTick();

    expect(allHidden.value).toBe(false);
    expect(message.value).toBe("sales_rep.hub.layout.restored");
    expect(activeMarker()).toBe("layoutEditToggle");
  });

  // The failure lands in edit mode, whose entry announcement must not drown out the failure itself.
  it("announces a restore that failed and hands focus to Save", async () => {
    apolloMock.mutate.mockRejectedValue(new Error("network"));
    renderChrome();

    const { restoreDefaults, editing, message } = withPage("customerProfile");

    await restoreDefaults();
    await nextTick();
    await nextTick();

    expect(editing.value).toBe(true);
    expect(message.value).toBe("sales_rep.hub.layout.save_failed");
    expect(activeMarker()).toBe("layoutSave");
  });

  it("enters edit mode from the empty state with focus on the edit toggle", async () => {
    renderChrome();

    const { editFromEmpty, editing } = withPage("customerProfile");

    editFromEmpty();
    await nextTick();
    await nextTick();

    expect(editing.value).toBe(true);
    expect(activeMarker()).toBe("layoutEditToggle");
  });

  // Saving with every block hidden swaps the toggle for the empty state, so its Edit layout button is the
  // only control left to take focus — without it focus drops to <body>.
  it("hands focus to the empty state's Edit layout when edit mode ends on an empty surface", async () => {
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: documentOf(hiddenBlock) } });
    const emptyEdit = document.createElement("button");
    emptyEdit.dataset.layoutEmptyEdit = "";
    document.body.append(emptyEdit);

    const { startEdit, save, allHidden } = withPage("customerProfile");
    startEdit();

    await expect(save()).resolves.toBe(true);
    await nextTick();
    await nextTick();

    expect(allHidden.value).toBe(true);
    expect(activeMarker()).toBe("layoutEmptyEdit");
  });
});
