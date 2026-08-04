import { computed } from "vue";
import { useRoute } from "vue-router";
import { useLanguages } from "./useLanguages";

/**
 * True on the storefront homepage, locale prefix or not.
 *
 * Uses the strict `getUrlWithoutLocale`: the `...PossibleLocale` variant matches any two-letter
 * segment, so it would treat "/xy" as the homepage and publish store-level markup on a 404.
 * `app-runner` uses the loose variant only because it runs before the store's language list is known.
 */
export function useIsHomePage() {
  const route = useRoute();
  const { getUrlWithoutLocale } = useLanguages();

  return computed(() => getUrlWithoutLocale(route.path) === "/");
}
