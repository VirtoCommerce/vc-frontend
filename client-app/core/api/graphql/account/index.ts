export { default as createUser } from "./mutations/createUser";
export { default as createOrganization } from "./mutations/createOrganization";
export { default as createContact } from "./mutations/createContact";
export { default as updatePersonalData } from "./mutations/updatePersonalData";
export { default as updateMemberAddresses } from "./mutations/updateMemberAddresses";
export { default as deleteMemberAddresses } from "./mutations/deleteMemberAddresses";
export { default as addWishlist } from "./mutations/addWishlist";
export { default as addWishlistItem } from "./mutations/addWishlistItem";
export { default as deleteWishlist } from "./mutations/deleteWishlist";
export { default as deleteWishlistItem } from "./mutations/deleteWishlistItem";
export { default as renameWishlist } from "./mutations/renameWishlist";

export { default as getMe } from "./queries/getMe";
export { default as getMyAddresses } from "./queries/getMyAddresses";
export { default as getDefaultShippingAddress } from "./queries/getDefaultShippingAddress";
export { default as getMyOrders } from "./queries/getMyOrders";
export { default as getMyOrder } from "./queries/getMyOrder";
export { default as getWishlists } from "./queries/getWishlists";

export * from "./types";
