import { MAIN_COLORS } from "@/ui-kit/constants";

export function isMainColorType(value: string): value is VcMainColorType {
  return MAIN_COLORS.includes(value as VcMainColorType);
}

export function getColorValue(color: string): string {
  if (isValidCssVariableName(color)) {
    return `var(${color})`;
  } else if (isMainColorType(color)) {
    return `var(--color-${color}-500)`;
  } else if (isValidColor(color)) {
    return color;
  }

  return "";
}

export function isValidCssVariableName(value: string): boolean {
  const cssVarRegex = /^--[\w-]+$/;
  return cssVarRegex.test(value);
}

export function isValidColor(value: string): boolean {
  return CSS.supports("color", value);
}
