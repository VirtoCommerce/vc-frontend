export type CreateWishlistPayloadType = {
  listName?: string;
  description?: string;
  scope?: string;
  sharingKey?: string;
  // Principal the list is shared with, when the scope defines a target (its id space is the scope's own). Simply
  // omitted for scopes that have none: the backend applies `sharedWithId: null` for every non-targeted scope, so
  // leaving a targeted scope detaches the target without the client having to say so.
  sharedWithId?: string;
};
