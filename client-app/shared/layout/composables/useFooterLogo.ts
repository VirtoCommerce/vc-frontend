import { computed } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";

/**
 * The logo the footer shows on its dark background. With the new Page Builder it is the header's logo for dark
 * backgrounds, from the source of the light logo, else the light logo itself; without it the footer keeps the logo for
 * dark backgrounds field by field, as before.
 */
export function useFooterLogo() {
  const { logoUrl, darkLogoUrl, secondaryLogoUrl } = useWhiteLabeling();

  const footerLogoUrl = computed(() =>
    isNewPageBuilderEnabled() ? (darkLogoUrl.value ?? logoUrl.value) : secondaryLogoUrl.value,
  );

  return { footerLogoUrl };
}
