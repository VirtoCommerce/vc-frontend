declare global {
  type VcButtonColorType = VcMainColorType;
  type VcButtonVariantType =
    | "solid"
    | "outline"
    | "soft"
    | "surface"
    | "ghost"
    /** @deprecated Use "soft" instead. */
    | "solid-light"
    /** @deprecated Use "surface" instead. */
    | "no-border"
    /** @deprecated Use "ghost" instead. */
    | "no-background";
  type VcButtonTypeType = "button" | "reset" | "submit";
  type VcButtonSizeType = "xxs" | "xs" | "sm" | "md" | "lg";
  type VcButtonExposedType = {
    focus: () => void;
    blur: () => void;
    el: Ref<HTMLElement | null>;
  };
}

export {};
