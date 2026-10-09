declare global {
  type VcBadgeColorType = VcMainColorType;
  type VcBadgeVariantType =
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
  type VcBadgeSizeType = "xs" | "sm" | "md" | "lg";
}

export {};
