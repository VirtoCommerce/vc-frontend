declare global {
  type VcCheckboxGroupContextType = {
    modelValue: (string | number | object)[];
    toggleValue: (value: string | number | object) => void;
  };
}

export {};
