import { computed } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import { useThemeSnapshot } from "@/core/theme-snapshot";

export function useFooterLogo() {
  const { logoUrl, darkLogoUrl, secondaryLogoUrl } = useWhiteLabeling();
  const { isThemeApplied } = useThemeSnapshot();

  const footerLogoUrl = computed(() =>
    isThemeApplied() ? (darkLogoUrl.value ?? logoUrl.value) : secondaryLogoUrl.value,
  );

  return { footerLogoUrl };
}
