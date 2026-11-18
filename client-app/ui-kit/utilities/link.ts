import type { RouteLocationRaw } from "vue-router";

type LinkAttrType = { to: RouteLocationRaw } | { externalLink: string } | object;

export const getLinkAttr = (link?: RouteLocationRaw): LinkAttrType => {
  if (typeof link === "string") {
    if (link.startsWith("/")) {
      return { to: link };
    } else {
      return { externalLink: link };
    }
  }
  return {};
};
