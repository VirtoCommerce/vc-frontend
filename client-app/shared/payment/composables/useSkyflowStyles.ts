import { useCssVar } from "@vueuse/core";
import { useDarkMode } from "@/core/composables";

// Fallback colors used when CSS custom properties are not defined
const FALLBACK_PRIMARY = "#eb9016";
const FALLBACK_PRIMARY_DARK = "#fbbf24";
const FALLBACK_ERROR = "#de3131";
const FALLBACK_ERROR_DARK = "#f87171";
const FALLBACK_BORDER = "#a3a3a3";
const FALLBACK_BACKGROUND = "#ffffff";
const FALLBACK_TEXT = "#1f2937";
const FALLBACK_RADIUS = "0.5rem";

const CARD_ICON_STYLES = {
  position: "absolute",
  left: "12px",
  bottom: "calc(50% - 14px)",
  width: "28px",
  height: "28px",
};

export function useSkyflowStyles() {
  const { isDark } = useDarkMode();

  // CSS custom properties are read once — Skyflow iframes do not support dynamic style updates
  const vcInputRadius = useCssVar("--vc-input-radius").value;
  const defaultRadius = useCssVar("--vc-radius").value;
  const primaryColor = useCssVar("--color-primary-500").value || FALLBACK_PRIMARY;
  const primaryColorDark = useCssVar("--color-primary-700").value || FALLBACK_PRIMARY_DARK;
  const errorColor = useCssVar("--color-danger-500").value || FALLBACK_ERROR;
  const errorColorDark = useCssVar("--color-danger-700").value || FALLBACK_ERROR_DARK;
  const borderColor = useCssVar("--color-neutral-400").value || FALLBACK_BORDER;
  const backgroundColor = useCssVar("--color-additional-50").value || FALLBACK_BACKGROUND;
  const textColor = useCssVar("--body-text-color").value || FALLBACK_TEXT;

  const globalStyles = {
    global: {
      "@import":
        'url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700&subset=cyrillic&display=swap")',
    },
    fontFamily: "Lato, sans-serif",
    primaryColor,
    errorColor: isDark.value ? errorColorDark : errorColor,
    borderColor,
    invalidBorder: `1px solid ${errorColor}`,
    backgroundColor,
    borderRadius: vcInputRadius || defaultRadius || FALLBACK_RADIUS,
    focusBorder: "1px solid transparent",
    focusShadow: isDark.value
      ? `0 0 0 3px rgb(from ${primaryColorDark} r g b / 0.8)`
      : `0 0 0 3px rgb(from ${primaryColor} r g b / 0.3)`,
    textColor,
  };

  const baseInputStyles = {
    fontFamily: globalStyles.fontFamily,
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1rem",
    lineHeight: "1.25rem",
    background: globalStyles.backgroundColor,
    borderRadius: globalStyles.borderRadius,
    border: `1px solid ${globalStyles.borderColor}`,
    textSecurity: "none",
    "&:focus": `border: ${globalStyles.focusBorder}; box-shadow: ${globalStyles.focusShadow}`,
    padding: "0.75rem",
    color: globalStyles.textColor,
    width: "100%",
  };

  const baseLabelStyles = {
    fontFamily: globalStyles.fontFamily,
    fontSize: "1rem",
    fontWeight: "700",
    paddingBottom: "0.25rem",
    color: globalStyles.textColor,
    background: globalStyles.backgroundColor,
  };

  const baseErrorStyles = {
    fontFamily: globalStyles.fontFamily,
    fontSize: "0.625rem",
    color: globalStyles.errorColor,
    minHeight: "0.75rem",
    background: globalStyles.backgroundColor,
  };

  const containerStyles = {
    fontFamily: globalStyles.fontFamily,
    width: "100%",
    gap: "24px",
    padding: "0 4px",
    background: globalStyles.backgroundColor,
  };

  const invalidStyles = { border: globalStyles.invalidBorder };
  const requiredAsteriskStyles = { color: globalStyles.errorColor };

  const containerErrorTextStyles = {
    base: baseErrorStyles,
    global: globalStyles.global,
  };

  const newCardCollectStyles = {
    inputStyles: {
      base: baseInputStyles,
      invalid: invalidStyles,
      cardIcon: CARD_ICON_STYLES,
    },
    labelStyles: {
      base: baseLabelStyles,
      requiredAsterisk: requiredAsteriskStyles,
    },
  };

  const newCardCvvCollectStyles = {
    ...newCardCollectStyles,
    inputStyles: {
      ...newCardCollectStyles.inputStyles,
      base: { ...newCardCollectStyles.inputStyles.base, textSecurity: "disc" },
    },
  };

  const cvvOnlyCollectStyles = {
    inputStyles: {
      base: { ...baseInputStyles, width: "6rem" },
      invalid: invalidStyles,
      global: globalStyles.global,
    },
    labelStyles: {
      base: baseLabelStyles,
      requiredAsterisk: requiredAsteriskStyles,
      global: globalStyles.global,
    },
    errorTextStyles: {
      base: baseErrorStyles,
      global: globalStyles.global,
    },
  };

  return {
    containerStyles,
    containerErrorTextStyles,
    newCardCollectStyles,
    newCardCvvCollectStyles,
    cvvOnlyCollectStyles,
  };
}
