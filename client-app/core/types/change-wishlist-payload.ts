import type { CreateWishlistPayloadType } from "./create-wishlist-payload";

export type ChangeWishlistPayloadType = CreateWishlistPayloadType & {
  listId: string;
  // Delta, never replace-set: a client with an incomplete view would otherwise revoke everyone it has not loaded.
  // Both omitted leaves the recipients untouched.
  addSharedWithIds?: string[];
  removeSharedWithIds?: string[];
  // Saved with the share. An empty string clears it; omitted leaves it.
  message?: string;
};
