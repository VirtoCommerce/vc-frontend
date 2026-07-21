declare global {
  type VcAlertColorType = "info" | "success" | "warning" | "danger";
  type VcAlertVariantType =
    | "solid"
    | "soft"
    | "outline"
    | "tonal"
    /** @deprecated Use "soft" instead. */
    | "solid-light"
    /** @deprecated Use "tonal" instead. */
    | "outline-dark";
  type VcAlertSizeType = "sm" | "md";
}

export {};
