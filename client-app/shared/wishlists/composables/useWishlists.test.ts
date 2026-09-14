import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWishlists } from "./useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

const mocks = vi.hoisted(() => ({
  changeWishlist: vi.fn(),
  getWishlists: vi.fn(),
  getWishList: vi.fn(),
}));

vi.mock("@/core/api/graphql/account", () => ({
  addWishlist: vi.fn(),
  addWishlistBulkItem: vi.fn(),
  changeWishlist: mocks.changeWishlist,
  deleteWishlist: vi.fn(),
  deleteWishlistItem: vi.fn(),
  getWishList: mocks.getWishList,
  getSharedWishList: vi.fn(),
  getWishlists: mocks.getWishlists,
  updateWishlistItems: vi.fn(),
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn(), warn: vi.fn() },
  asyncForEach: vi.fn(),
}));

// What the list queries carry and the `changeWishlist` selection set does not.
function card(id: string, name: string): WishlistType {
  return {
    id,
    name,
    itemsCount: 7,
    modifiedDate: "2026-09-01T00:00:00Z",
    sharingSetting: { id: `sharing-${id}`, scope: "Private", targets: [] },
  } as unknown as WishlistType;
}

function saved(id: string, name: string, targetIds: string[] = []): WishlistType {
  return {
    id,
    name,
    description: "",
    items: [],
    sharingSetting: { id: `sharing-${id}`, scope: "Customer", targets: targetIds.map((target) => ({ id: target })) },
  } as unknown as WishlistType;
}

const { updateWishlist, fetchWishlists, fetchWishList, lists, list } = useWishlists({ autoRefetch: false });

beforeEach(() => {
  mocks.changeWishlist.mockReset();
  mocks.getWishlists.mockReset().mockResolvedValue({ items: [card("list-1", "Spring"), card("list-2", "Autumn")] });
  mocks.getWishList.mockReset();
});

describe("updateWishlist", () => {
  it("puts the saved sharing on the card the lists page is showing", async () => {
    await fetchWishlists();
    mocks.changeWishlist.mockResolvedValue(saved("list-1", "Spring", ["org-1", "org-2"]));

    await updateWishlist({ listId: "list-1", scope: "Customer" });

    const updated = lists.value.find((wishlist) => wishlist.id === "list-1")!;
    expect(updated.sharingSetting?.targets).toHaveLength(2);
    expect(lists.value.find((wishlist) => wishlist.id === "list-2")?.sharingSetting?.targets).toHaveLength(0);
  });

  it("keeps the fields the mutation does not ask for", async () => {
    await fetchWishlists();
    mocks.changeWishlist.mockResolvedValue(saved("list-1", "Spring renamed"));

    await updateWishlist({ listId: "list-1", listName: "Spring renamed" });

    const updated = lists.value.find((wishlist) => wishlist.id === "list-1")!;
    // A straight swap would blank the card's badge and its "last modified" line.
    expect(updated.itemsCount).toBe(7);
    expect(updated.modifiedDate).toBe("2026-09-01T00:00:00Z");
    expect(updated.name).toBe("Spring renamed");
  });

  it("refreshes the open list when the save is about that list", async () => {
    mocks.getWishList.mockResolvedValue(card("list-1", "Spring"));
    await fetchWishList("list-1");
    mocks.changeWishlist.mockResolvedValue(saved("list-1", "Spring", ["org-1"]));

    await updateWishlist({ listId: "list-1", scope: "Customer" });

    expect(list.value?.sharingSetting?.targets).toHaveLength(1);
  });

  it("leaves the open list alone when the save is about another one", async () => {
    mocks.getWishList.mockResolvedValue(card("list-2", "Autumn"));
    await fetchWishList("list-2");
    await fetchWishlists();
    mocks.changeWishlist.mockResolvedValue(saved("list-1", "Spring", ["org-1"]));

    await updateWishlist({ listId: "list-1", scope: "Customer" });

    // `list` is shared with whatever page is mounted; a save from the lists page must not put another list under it.
    expect(list.value?.id).toBe("list-2");
    expect(list.value?.name).toBe("Autumn");
  });
});
