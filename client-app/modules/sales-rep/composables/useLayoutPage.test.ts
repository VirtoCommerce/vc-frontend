import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useLayoutPage } from "./useLayoutPage";

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
  }),
  useMutation: () => ({ mutate: apolloMock.mutate, loading: apolloMock.saving }),
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

beforeEach(() => {
  apolloMock.result.value = { salesRepLayout: null };
  apolloMock.error.value = undefined;
  apolloMock.saving.value = false;
  apolloMock.mutate.mockReset();
});

afterEach(() => {
  document.body.innerHTML = "";
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

    const { startEdit, save, editing } = useLayoutPage("customerProfile");
    startEdit();

    await save();
    await nextTick();
    await nextTick();

    expect(editing.value).toBe(true);
    expect(activeMarker()).toBe("layoutSave");
  });

  it("returns focus to the edit toggle when edit mode ends", async () => {
    apolloMock.mutate.mockResolvedValue({ data: { saveSalesRepLayout: { schemaVersion: 1, regions: [] } } });
    renderChrome();

    const { startEdit, save } = useLayoutPage("customerProfile");
    startEdit();

    await save();
    await nextTick();
    await nextTick();

    expect(activeMarker()).toBe("layoutEditToggle");
  });

  // Both widget columns share one tray, so a page reads them as a single list.
  it("gathers hidden widgets from both columns", () => {
    const { startEdit, toggleHidden, hiddenWidgets } = useLayoutPage("customerProfile");
    startEdit();

    toggleHidden("orders", true);
    toggleHidden("info", true);

    expect(hiddenWidgets.value).toEqual(["orders", "info"]);
  });
});
