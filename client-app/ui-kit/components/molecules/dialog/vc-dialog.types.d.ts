declare global {
  type VcDialogSizeType = "xs" | "sm" | "md";

  type VcDialogContextType = {
    size: import("vue").Ref<VcDialogSizeType>;
  };
}

export {};
