import { computed } from "vue";
import { useRoute } from "vue-router";
import { useLanguages } from "./useLanguages";

/** True on the storefront homepage, locale prefix or not. */
export function useIsHomePage() {
  const route = useRoute();
  const { getUrlWithoutLocale } = useLanguages();

  return computed(() => getUrlWithoutLocale(route.path) === "/");
}
