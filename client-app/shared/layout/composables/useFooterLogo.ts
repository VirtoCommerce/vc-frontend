import { computed } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";

export function useFooterLogo() {
  const { logoUrl, darkLogoUrl, secondaryLogoUrl } = useWhiteLabeling();

  const footerLogoUrl = computed(() =>
    isNewPageBuilderEnabled() ? (darkLogoUrl.value ?? logoUrl.value) : secondaryLogoUrl.value,
  );

  return { footerLogoUrl };
}
