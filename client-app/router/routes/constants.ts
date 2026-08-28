export const ROUTES = {
  CATALOG: {
    NAME: "Catalog",
    PATH: "/catalog",
  },
  LOYALTY_CATALOG: {
    NAME: "LoyaltyCatalog",
    PATH: "/loyalty-catalog",
  },
  LOYALTY_PRODUCT: {
    NAME: "LoyaltyProduct",
    PATH: "/loyalty-catalog/product/:productId",
  },
  LOYALTY_CATEGORY: {
    NAME: "LoyaltyCategory",
    PATH: "/loyalty-catalog/category/:categoryId",
  },
  SEARCH: {
    NAME: "Search",
    PATH: "/search",
  },
  SIGN_IN: {
    NAME: "SignIn",
    PATH: "/sign-in",
  },
  CART: {
    NAME: "Cart",
    PATH: "/cart",
  },
  CART_ID: {
    NAME: "CartId",
    PATH: "/cart/:cartId",
  },
  CHANGE_PASSWORD: {
    NAME: "ChangePassword",
    PATH: "/change-password",
  },
  SAVED_FOR_LATER: {
    NAME: "SavedForLater",
  },
  PROMOTION_COUPONS: {
    NAME: "PromotionCoupons",
    PATH: "coupons",
  },
  // Parent routes that modules (and out-of-repo plugins) mount their own routes under, so the
  // name is a contract: `router.addRoute(parentName, ...)` throws when it no longer resolves.
  ACCOUNT: {
    NAME: "Account",
    PATH: "/account",
  },
  COMPANY: {
    NAME: "Company",
    PATH: "/company",
  },
} as const;
