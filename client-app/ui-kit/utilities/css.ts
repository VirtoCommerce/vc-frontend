import { MAIN_COLORS } from "@/ui-kit/constants";

export function isMainColorType(value: string): value is VcMainColorType {
  return MAIN_COLORS.includes(value as VcMainColorType);
}

export function getColorValue(color: string | undefined): string | undefined {
  if (!color) {
    return;
  }

  if (isValidCssVariableName(color)) {
    return `var(${color})`;
  } else if (isMainColorType(color)) {
    return `var(--color-${color}-500)`;
  } else if (isValidColor(color)) {
    return color;
  }
}

export function isValidCssVariableName(value: string): boolean {
  const cssVarRegex = /^--[\w-]+$/;
  return cssVarRegex.test(value);
}

export function isValidColor(value: string): boolean {
  return CSS.supports("color", value);
}

/** Clear-button icon size inside input shells, keyed off the input size. */
export function getInputClearIconSize(size: VcInputSizeType): string {
  return size === "md" ? "0.875rem" : "0.75rem";
}
