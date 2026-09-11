import { useDarkMode } from "@/core/composables";
import { readCssVar } from "@/ui-kit/utilities";

// Fallback colors used when CSS custom properties are not defined
const FALLBACK_PRIMARY = "#eb9016";
const FALLBACK_FOCUS_RING = "#1b789b";
const FALLBACK_FOCUS_RING_WIDTH = "2px";
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
  const vcInputRadius = readCssVar("--vc-input-radius");
  const defaultRadius = readCssVar("--vc-radius");
  const primaryColor = readCssVar("--color-primary-500") || FALLBACK_PRIMARY;
  const focusRingColor = readCssVar("--vc-focus-ring-color") || FALLBACK_FOCUS_RING;
  const focusRingWidth = readCssVar("--vc-focus-ring-width") || FALLBACK_FOCUS_RING_WIDTH;
  const errorColor = readCssVar("--color-danger-500") || FALLBACK_ERROR;
  const errorColorDark = readCssVar("--color-danger-700") || FALLBACK_ERROR_DARK;
  const borderColor = readCssVar("--color-neutral-400") || FALLBACK_BORDER;
  const backgroundColor = readCssVar("--color-additional-50") || FALLBACK_BACKGROUND;
  const textColor = readCssVar("--body-text-color") || FALLBACK_TEXT;

  const resolvedErrorColor = isDark.value ? errorColorDark : errorColor;

  const globalStyles = {
    global: {
      "@import":
        'url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700&subset=cyrillic&display=swap")',
    },
    fontFamily: "Lato, sans-serif",
    primaryColor,
    errorColor: resolvedErrorColor,
    borderColor,
    invalidBorder: `1px solid ${resolvedErrorColor}`,
    backgroundColor,
    borderRadius: vcInputRadius || defaultRadius || FALLBACK_RADIUS,
    focusBorder: "1px solid transparent",
    focusShadow: `0 0 0 ${focusRingWidth} ${focusRingColor}`,
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
