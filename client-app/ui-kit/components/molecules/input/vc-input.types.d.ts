import type { Ref } from "vue";

declare global {
  type VcInputSizeType = "xs" | "sm" | "md" | "auto";
  type VcInputAlignType = "start" | "center" | "end";

  type VcInputContextType = {
    size: Ref<VcInputSizeType>;
  };
}
