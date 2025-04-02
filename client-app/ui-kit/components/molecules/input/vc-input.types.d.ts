import type { Ref } from "vue";

declare global {
  type VcInputSizeType = "xs" | "sm" | "md" | "auto";

  type VcInputContextType = {
    size: Ref<VcInputSizeType>;
  };
}
