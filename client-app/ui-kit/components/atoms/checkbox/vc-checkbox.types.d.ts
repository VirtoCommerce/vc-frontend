declare global {
  type VcCheckboxExposedType = {
    /** The native input, for a parent that hands focus to it; null inside an interactive parent, which renders none. */
    inputElement: HTMLInputElement | null;
  };
}

export {};
