import type { RouteLocationRaw } from "vue-router";

/** @deprecated */
export type MenuLinkType = {
  id?: string;
  title?: string;
  icon?: string;
  route?: RouteLocationRaw;
  children?: MenuLinkType[];
  priority?: number;
};
