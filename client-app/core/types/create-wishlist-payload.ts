export type CreateWishlistPayloadType = {
  listName?: string;
  description?: string;
  scope?: string;
  sharingKey?: string;
  // Principal the list is shared with, for scopes that define a target. Omitted otherwise: the backend applies a null
  // target for its non-targeted scopes, so leaving one detaches the target without the client saying so.
  sharedWithId?: string;
};
