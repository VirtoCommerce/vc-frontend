import type { Ref } from "vue";

declare global {
  type VcVariantPickerGroupContextType = {
    modelValue: Ref<string | string[]>;
    multiple: Ref<boolean>;
    size: Ref<VcVariantPickerSizeType | undefined>;
    type: Ref<VcVariantPickerType | undefined>;
    name: Ref<string | undefined>;
    toggleValue: (value: string | string[]) => void;
  };
}
