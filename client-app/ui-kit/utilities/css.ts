import { COLORS } from "../constants";

const VcColors = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.neutral,
  COLORS.info,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
] as const;

export type VcColorType = (typeof VcColors)[number];

export function isVcColorType(value: string): value is VcColorType {
  return VcColors.includes(value as VcColorType);
}

export function getColorValue(color: string): string {
  if (isValidCssVariableName(color)) {
    return `var(${color})`;
  } else if (isVcColorType(color)) {
    return `--color-${color}-500`;
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
