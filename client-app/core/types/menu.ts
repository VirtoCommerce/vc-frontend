import type { RouteLocationRaw } from "vue-router";

export type MenuLinkType = {
  id?: string;
  title?: string;
  icon?: string;
  route?: RouteLocationRaw;
  children?: MenuLinkType[];
  priority?: number;
};
