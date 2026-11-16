import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useSavedForLaterAnalytics } from "./useSavedForLaterAnalytics";
import type { SavedForLaterListFragment } from "@/core/api/graphql/types";

const analytics = vi.hoisted(() => vi.fn());

vi.mock("@/core/composables/useAnalytics", () => ({
  useAnalytics: () => ({ analytics }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

type ItemType = SavedForLaterListFragment["items"][number];

const LIST_PROPERTIES = { item_list_id: "saved_for_later", item_list_name: "pages.cart.saved_for_later" };

function items(productIds: string[]): ItemType[] {
  return productIds.map((id) => ({ id: `line-${id}`, productId: id, product: { id } }) as unknown as ItemType);
}

describe("useSavedForLaterAnalytics", () => {
  beforeEach(() => {
    analytics.mockClear();
  });

  it("reports the list once while its lines stay the same, however often the list is refetched", async () => {
    const available = ref(items(["p", "q"]));
    useSavedForLaterAnalytics(available, false);

    available.value = items(["p", "q"]);
    await nextTick();
    available.value = items(["p", "q"]);
    await nextTick();

    expect(analytics.mock.calls).toEqual([["viewItemList", [{ id: "p" }, { id: "q" }], LIST_PROPERTIES]]);
  });

  it("reports the list again when its lines change", async () => {
    const available = ref(items(["p", "q"]));
    useSavedForLaterAnalytics(available, false);

    available.value = items(["x", "p", "q"]);
    await nextTick();

    expect(analytics.mock.calls).toEqual([
      ["viewItemList", [{ id: "p" }, { id: "q" }], LIST_PROPERTIES],
      ["viewItemList", [{ id: "x" }, { id: "p" }, { id: "q" }], LIST_PROPERTIES],
    ]);
  });

  it("reports nothing when the widget is hidden", () => {
    useSavedForLaterAnalytics(ref(items(["p"])), true);

    expect(analytics).not.toHaveBeenCalled();
  });

  it("sends a selected product with its position in the list", () => {
    const { selectItem } = useSavedForLaterAnalytics(ref(items(["p", "q"])), false);
    analytics.mockClear();

    selectItem({ id: "q" } as ItemType["product"], 1);

    expect(analytics).toHaveBeenCalledWith("selectItem", { id: "q" }, { ...LIST_PROPERTIES, index: 1 });
  });
});
