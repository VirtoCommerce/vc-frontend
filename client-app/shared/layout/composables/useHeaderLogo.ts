import { computed } from "vue";
import { useDarkMode, useWhiteLabeling } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";

/**
 * The logo the header shows. With the new Page Builder the dark theme takes the logo made for dark backgrounds
 * (`secondaryLogoUrl`); without it the header keeps the one logo, as before.
 */
export function useHeaderLogo() {
  const { logoUrl, secondaryLogoUrl } = useWhiteLabeling();
  const { isDark } = useDarkMode();

  const headerLogoUrl = computed(() =>
    isNewPageBuilderEnabled() && isDark.value && secondaryLogoUrl.value ? secondaryLogoUrl.value : logoUrl.value,
  );

  return { headerLogoUrl };
}
