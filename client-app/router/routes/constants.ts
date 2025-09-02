export const ROUTES = {
  CATALOG: {
    NAME: "Catalog",
    PATH: "/catalog",
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
} as const;
