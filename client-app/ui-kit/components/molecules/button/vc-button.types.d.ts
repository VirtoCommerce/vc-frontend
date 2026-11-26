declare global {
  type VcButtonColorType = VcMainColorType;
  type VcButtonVariantType =
    | "solid"
    | "outline"
    | "soft"
    | "surface"
    | "ghost"
    | "tonal"
    /** @deprecated Use "soft" instead. */
    | "solid-light"
    /** @deprecated Use "surface" instead. */
    | "no-border"
    /** @deprecated Use "ghost" instead. */
    | "no-background";
  type VcButtonTypeType = "button" | "reset" | "submit";
  type VcButtonSizeType = "xxs" | "xs" | "sm" | "md" | "lg";
  /** What a container gives the buttons inside it; a button's own prop always wins. */
  type VcButtonContextType = {
    size?: VcButtonSizeType;
    color?: VcButtonColorType;
    variant?: VcButtonVariantType;
  };
  type VcButtonExposedType = {
    focus: () => void;
    blur: () => void;
    el: Ref<HTMLElement | null>;
  };
}

export {};
