import type { InjectionKey } from "vue";

export const vcMenuListKey: InjectionKey<VcMenuListContextType> = Symbol("vc-menu-list-context");

/** The item roles each list role owns; an item that sets another role gets a dev warning at mount. */
export const VC_MENU_LIST_ITEM_ROLES: Record<VcMenuListRoleType, readonly string[]> = {
  listbox: ["option"],
  menu: ["menuitem"],
};
