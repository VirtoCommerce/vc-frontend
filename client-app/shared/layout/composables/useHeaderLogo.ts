import { computed } from "vue";
import { useDarkMode, useWhiteLabeling } from "@/core/composables";
import { useThemeSnapshot } from "@/core/theme-snapshot";

export function useHeaderLogo() {
  const { logoUrl, darkLogoUrl } = useWhiteLabeling();
  const { isDark } = useDarkMode();
  const { isThemeApplied } = useThemeSnapshot();

  const headerLogoUrl = computed(() =>
    isThemeApplied() && isDark.value && darkLogoUrl.value ? darkLogoUrl.value : logoUrl.value,
  );

  return { headerLogoUrl };
}
