import type { RouteLocationRaw } from "vue-router";

type LinkAttrType = { to: RouteLocationRaw } | { link: string } | object;
export const getLinkAttr = (link?: string): LinkAttrType => {
  if (link) {
    if (link.startsWith("/")) {
      return { to: link };
    } else {
      return { externalLink: link };
    }
  }
  return {};
};
