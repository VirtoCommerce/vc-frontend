import type { Ref } from "vue";

declare global {
  type VcCheckboxGroupContextType = {
    modelValue: Ref<(string | number | object)[]>;
    toggleValue: (value: string | number | object) => void;
  };
}
