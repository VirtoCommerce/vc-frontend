import { RouteLocationRaw } from "vue-router";

export type MenuLink = {
  id?: string;
  title?: string;
  icon?: string;
  route?: RouteLocationRaw;
  children?: MenuLink[];
};
