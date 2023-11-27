import type { CreateWishlistPayloadType } from "./create-wishlist-payload";

export type ChangeWishlistPayloadType = CreateWishlistPayloadType & { listId: string };
