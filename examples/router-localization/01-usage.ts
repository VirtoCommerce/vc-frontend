import { useRouter } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { globals } from "@/core/globals";
import { resolveLocalizedRedirect } from "./localization.helpers";

function useSomeComposable() {
  const router = useRouter();

  const { themeContext } = useThemeContext();

  router.beforeEach((to, _from, next) => {
    // Normalize generic paths to current-locale paths (e.g., "/cart" -> "/carrinho") while preserving the visible URL
    // Only rewrite when navigating via named routes or plain paths that match a localized mapping
    const twoLetterFromCulture = globals.cultureName?.slice(0, 2);
    const currentLocale = twoLetterFromCulture ?? themeContext.value.defaultLanguage.twoLetterLanguageName;

    const redirect = resolveLocalizedRedirect(to, currentLocale);
    if (redirect) {
      return next(redirect);
    }

    // ... other code
  });

  // ... other code
}

export { useSomeComposable };
