import { computed } from "vue";
import { useCurrency } from "@/core/composables/useCurrency";
import { useDarkMode } from "@/core/composables/useDarkMode";
import { useLanguages } from "@/core/composables/useLanguages";
import { ROUTES } from "@/router/routes/constants";
import { useCatalogBasePath } from "@/shared/catalog/composables/useCatalogBasePath";

// Which groups the desktop preferences menu offers: each only when there is something to choose.
export function usePreferencesMenu() {
  const { supportedCurrencies } = useCurrency();
  const { supportedLanguages } = useLanguages();
  const { isDarkModeAvailable } = useDarkMode();
  const catalogBasePath = useCatalogBasePath();

  // The loyalty catalog prices in points, so its routes offer no currency.
  const isLoyaltyCatalogRoute = computed(() => catalogBasePath.value === ROUTES.LOYALTY_CATALOG.PATH);

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
