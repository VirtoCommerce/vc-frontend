import { computed } from "vue";
import { useRoute } from "vue-router";
import { useLanguages } from "./useLanguages";

/**
 * True on the storefront homepage, locale prefix or not.
 *
 * `getUrlWithoutLocale` strips only the store's real locales. The `...PossibleLocale` variant
 * matches any two-letter segment, so it would report "/xy" as the homepage.
 */
export function useIsHomePage() {
  const route = useRoute();
  const { getUrlWithoutLocale } = useLanguages();

  return computed(() => getUrlWithoutLocale(route.path) === "/");
}
