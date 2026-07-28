export type CreateWishlistPayloadType = {
  listName?: string;
  description?: string;
  scope?: string;
  sharingKey?: string;
  // Principal the list is shared with, when scope defines a target (e.g. a customer organization id for the
  // Sales Rep "Customer" scope). Omitted for the non-targeted scopes.
  sharedWithId?: string;
};
