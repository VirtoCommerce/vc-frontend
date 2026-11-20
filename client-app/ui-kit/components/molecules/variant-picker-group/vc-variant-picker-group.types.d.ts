import type { Ref } from "vue";

declare global {
  type VcVariantPickerGroupContextType = {
    modelValue: Ref<string | string[]>;
    multiple: Ref<boolean>;
    size: Ref<VcVariantPickerSizeType | undefined>;
    type: Ref<VcVariantPickerType | undefined>;
    name: Ref<string | undefined>;
    fill: Ref<boolean>;
    surface: Ref<VcVariantPickerGroupSurfaceType>;
    toggleValue: (value: string | string[]) => void;
    registerTopBadge: () => () => void;
  };

  type VcVariantPickerGroupColumnsType = "auto" | 1 | 2 | 3 | 4;
  type VcVariantPickerGroupSurfaceType = "base" | "tinted" | "dark";
}
