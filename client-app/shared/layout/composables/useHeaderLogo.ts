import { computed } from "vue";
import { useDarkMode, useWhiteLabeling } from "@/core/composables";
import { useThemeSnapshot } from "@/core/theme-snapshot";

export function useHeaderLogo() {
  const { logoUrl, darkLogoUrl } = useWhiteLabeling();
  const { isDark } = useDarkMode();
  const { isNewPageBuilderOn } = useThemeSnapshot();

  const headerLogoUrl = computed(() =>
    isNewPageBuilderOn() && isDark.value && darkLogoUrl.value ? darkLogoUrl.value : logoUrl.value,
  );

  return { headerLogoUrl };
}
