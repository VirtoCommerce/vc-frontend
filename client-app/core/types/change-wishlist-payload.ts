import type { CreateWishlistPayloadType } from "./create-wishlist-payload";

export type ChangeWishlistPayloadType = CreateWishlistPayloadType & {
  listId: string;
  // Sharing targets move by delta, never by replace-set: a client whose view of the set is incomplete would
  // otherwise revoke everyone it has not loaded. Both omitted leaves the current recipients untouched.
  addSharedWithIds?: string[];
  removeSharedWithIds?: string[];
  // Saved with the share and shown when the dialog is reopened. An empty string clears it; omitted leaves it.
  message?: string;
};
