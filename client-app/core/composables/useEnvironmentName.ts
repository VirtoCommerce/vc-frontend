import { useThemeContext } from "@/core/composables/useThemeContext";

const ENVIRONMENTS_TO_IGNORE = ["prod", "production"];

export function useEnvironmentName() {
  const { themeContext } = useThemeContext();

  const {
    storeSettings: { environmentName },
  } = themeContext.value;

  const isIgnored = !environmentName || ENVIRONMENTS_TO_IGNORE.includes(environmentName?.toLowerCase());

  return {
    environmentName,
    isIgnored,
  };
}
