import { getReturnUrlValue, toSameOriginPath } from "@/core/utilities";
import { useThemeContext } from "./useThemeContext";

export function useReturnUrl() {
  const { themeContext } = useThemeContext();

  /** The page to open once the user is signed in: the requested one, or the store default. */
  function getReturnUrl(url?: string): string {
    return toSameOriginPath(getReturnUrlValue(url) ?? themeContext.value.settings.default_return_url);
  }

  return {
    getReturnUrl,
  };
}
