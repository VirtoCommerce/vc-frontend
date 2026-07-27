declare global {
  type VcChipColorType = VcMainColorType;
  type VcChipVariantType =
    | "solid"
    | "soft"
    | "outline"
    | "surface"
    | "ghost"
    | "tonal"
    /** @deprecated Use "soft" instead. */
    | "solid-light"
    /** @deprecated Use "tonal" instead. */
    | "outline-dark";
  type VcChipSizeType = "sm" | "md" | "lg";
}

export {};
