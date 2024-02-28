import { computed } from "vue";
import { useThemeContext } from "@/core/composables";

export function usePasswordRequirements() {
  const { themeContext } = useThemeContext();

  return {
    passwordRequirements: computed(() => themeContext.value?.storeSettings?.passwordRequirements),
  };
}
