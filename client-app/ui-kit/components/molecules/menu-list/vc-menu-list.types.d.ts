import type { Ref } from "vue";

declare global {
  type VcMenuListRoleType = "listbox" | "menu";

  type VcMenuListItemType = {
    /** The item's focusable element; empty before mount. */
    el: () => HTMLElement | null | undefined;
    active: () => boolean;
    /** Not focusable: disabled, or not clickable (no button or link renders). */
    disabled: () => boolean;
  };

  type VcMenuListContextType = {
    listRole: Readonly<Ref<VcMenuListRoleType>>;
    /** The role an item takes when it sets none: `option` in a listbox, `menuitem` in a menu. */
    itemRole: Readonly<Ref<"option" | "menuitem">>;
    /** `true` while the item's element is inside the list's root; a teleported item does not join. */
    contains: (item: VcMenuListItemType) => boolean;
    isTabStop: (item: VcMenuListItemType) => boolean;
    onItemFocus: (item: VcMenuListItemType) => void;
    /** Adds an item to the list; returns the function that removes it. */
    register: (item: VcMenuListItemType) => () => void;
  };
}
