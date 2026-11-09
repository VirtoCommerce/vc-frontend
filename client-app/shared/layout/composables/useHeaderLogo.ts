import { computed } from "vue";
import { useDarkMode, useWhiteLabeling } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";

export function useHeaderLogo() {
  const { logoUrl, darkLogoUrl } = useWhiteLabeling();
  const { isDark } = useDarkMode();

  const headerLogoUrl = computed(() =>
    isNewPageBuilderEnabled() && isDark.value && darkLogoUrl.value ? darkLogoUrl.value : logoUrl.value,
  );

  return { headerLogoUrl };
}
