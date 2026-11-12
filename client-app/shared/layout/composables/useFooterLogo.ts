import { computed } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import { useThemeSnapshot } from "@/core/theme-snapshot";

export function useFooterLogo() {
  const { logoUrl, darkLogoUrl, secondaryLogoUrl } = useWhiteLabeling();
  const { isNewPageBuilderOn } = useThemeSnapshot();

  const footerLogoUrl = computed(() =>
    isNewPageBuilderOn() ? (darkLogoUrl.value ?? logoUrl.value) : secondaryLogoUrl.value,
  );

  return { footerLogoUrl };
}
