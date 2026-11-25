import type { InjectionKey } from "vue";

export const vcMenuListKey: InjectionKey<VcMenuListContextType> = Symbol("vc-menu-list-context");

/**
 * The item roles a VcMenuList accepts: checkable menu roles are left out, as aria-checked lands on VcMenuItem's
 * wrapper. An item that sets another role gets a dev warning at mount.
 */
export const VC_MENU_LIST_ITEM_ROLES: Record<VcMenuListRoleType, readonly string[]> = {
  listbox: ["option"],
  menu: ["menuitem"],
};

export const VC_MENU_LIST_CHECKABLE_ROLES: readonly string[] = ["menuitemradio", "menuitemcheckbox"];
