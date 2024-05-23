import { useThemeContext } from "@/core/composables/useThemeContext";
import { COLORS } from "@/core/constants";

const BADGE_COLORS: Record<string, VcBadgeColorType> = {
  dev: COLORS.secondary,
  qa: COLORS.info,
  demo: COLORS.success,
};

const ENVIRONMENTS_TO_IGNORE = ["prod", "production"];

export function useEnvironmentName() {
  const { themeContext } = useThemeContext();

  const {
    storeSettings: { environmentName },
  } = themeContext.value;

  const badgeColor: VcBadgeColorType = BADGE_COLORS[environmentName?.toLowerCase() ?? COLORS.neutral];
  const shouldShowBadge = !!environmentName && !ENVIRONMENTS_TO_IGNORE.includes(environmentName);

  return {
    badgeColor,
    environmentName,
    shouldShowBadge,
  };
}
