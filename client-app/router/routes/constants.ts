type RouteType = {
  NAME: string;
  PATH: string;
};

export const ROUTES: { [key: string]: RouteType } = {
  CATALOG: {
    NAME: "Catalog",
    PATH: "/catalog",
  },
} as const;
