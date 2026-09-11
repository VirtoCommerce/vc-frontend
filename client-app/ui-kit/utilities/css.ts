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

// One-shot read of a custom property's computed value (var() chains already substituted).
// Not `useCssVar`: it writes what it read back as an inline style on the target, which then
// outranks the preset's `:root` / `html.dark` rules and freezes the value across a theme switch.
export function readCssVar(name: string, target?: HTMLElement | null): string {
  return getComputedStyle(target ?? document.documentElement)
    .getPropertyValue(name)
    .trim();
}
