import type { Ref } from "vue";

declare global {
  type VcTabSwitchGroupValueType = string | number | boolean;

  type VcTabSwitchGroupItemType = {
    value: () => VcTabSwitchGroupValueType;
    disabled: () => boolean;
  };

  type VcTabSwitchGroupContextType = {
    modelValue: Ref<VcTabSwitchGroupValueType | undefined>;
    /** `false` while no enabled item matches the model, so every enabled item stays a tab stop. */
    hasCheckedItem: Readonly<Ref<boolean>>;
    name: string;
    select: (value: VcTabSwitchGroupValueType) => void;
    /** Adds an item to the group; returns the function that removes it. */
    register: (item: VcTabSwitchGroupItemType) => () => void;
  };
}
