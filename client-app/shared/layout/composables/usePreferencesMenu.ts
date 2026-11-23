import { computed } from "vue";
import { useRoute } from "vue-router";
import { useCurrency } from "@/core/composables/useCurrency";
import { useDarkMode } from "@/core/composables/useDarkMode";
import { useLanguages } from "@/core/composables/useLanguages";
import { ROUTES } from "@/router/routes/constants";
import { getCatalogBasePath } from "@/shared/catalog/composables/useCatalogBasePath";

// Which groups the desktop preferences menu offers: each only when there is something to choose.
export function usePreferencesMenu() {
  const route = useRoute();
  const { supportedCurrencies } = useCurrency();
  const { supportedLanguages } = useLanguages();
  const { isDarkModeAvailable } = useDarkMode();

  // The loyalty catalog prices in points, so its routes offer no currency.
  const isLoyaltyCatalogRoute = computed(() => getCatalogBasePath(route.path) === ROUTES.LOYALTY_CATALOG.PATH);

  const isCurrencyShown = computed(() => !isLoyaltyCatalogRoute.value && (supportedCurrencies.value?.length ?? 0) > 1);
  const isAppearanceShown = computed(() => isDarkModeAvailable.value);
  const isLanguageShown = computed(() => (supportedLanguages.value?.length ?? 0) > 1);
  const hasPreferences = computed(() => isCurrencyShown.value || isAppearanceShown.value || isLanguageShown.value);

  return {
    isCurrencyShown,
    isAppearanceShown,
    isLanguageShown,
    hasPreferences,
  };
}
