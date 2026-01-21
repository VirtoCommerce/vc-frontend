declare global {
  type VcButtonColorType = VcMainColorType;
  type VcButtonVariantType = "solid" | "outline" | "no-border" | "no-background" | "solid-light";
  type VcButtonTypeType = "button" | "reset" | "submit";
  type VcButtonSizeType = "xxs" | "xs" | "sm" | "md" | "lg";
  type VcButtonExposedType = {
    focus: () => void;
    blur: () => void;
    el: HTMLElement | null;
  };
}

export {};
