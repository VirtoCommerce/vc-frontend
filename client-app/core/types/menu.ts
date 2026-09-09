import type { ComputedRef } from "vue";
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from "vue-router";

// A whole account left-rail section registered by a module (e.g. the Sales Rep hub). Rendered as a
// VcWidget on desktop (priority-ordered among the built-in sections) and a drill-down on mobile.
export type AccountNavigationSectionType = {
  id: string;
  title: string;
  icon?: string;
  // Ordering weight — DESKTOP ONLY (account-navigation.vue sorts by it). Ignored on mobile, where
  // registered sections are prepended in registration order (main-menu.vue); priority-aware mobile
  // is deferred to the mobile-menu redesign.
  priority?: number;
  children: ExtendedMenuLinkType[];
  // Reactive gate; a section without it is always shown.
  isVisible?: ComputedRef<boolean>;
};

export type MenuType = {
  header: {
    desktop: {
      main: ExtendedMenuLinkType[];
      purchasing: ExtendedMenuLinkType;
      marketing: ExtendedMenuLinkType;
      user: ExtendedMenuLinkType;
      corporate: ExtendedMenuLinkType;
    };
    mobile: {
      main: ExtendedMenuLinkType[];
      purchasing: ExtendedMenuLinkType;
      marketing: ExtendedMenuLinkType;
      user: ExtendedMenuLinkType;
      corporate: ExtendedMenuLinkType;
    };
  };
  footer: ExtendedMenuLinkType[];
};

export type MobileMenuSectionType = Exclude<keyof MenuType["header"]["mobile"], "main">;
export type DesktopMenuSectionType = Exclude<keyof MenuType["header"]["desktop"], "main">;

export type MenuSecionType = MobileMenuSectionType | DesktopMenuSectionType;

export type ExtendedMenuLinkType = {
  id?: string;
  title?: string;
  icon?: string;
  route?: RouteLocationRaw;
  children?: ExtendedMenuLinkType[];
  priority?: number;
  isCatalogItem?: boolean;
  dataTestId?: string;
  // Optional override for the account rail's active state. vue-router marks a link active by route
  // RECORD, which cannot express "this page belongs to another item" — sibling records under the
  // same parent share nothing — nor a rule that depends on the query. A link that owns more pages
  // than its own record says so here; without it the record match stands.
  activeWhen?: (route: RouteLocationNormalizedLoaded) => boolean;
};

export type MarkedMenuLinkType = ExtendedMenuLinkType & {
  isActive?: boolean;
  type?: "pinned" | "category";
  children?: MarkedMenuLinkType[];
};
