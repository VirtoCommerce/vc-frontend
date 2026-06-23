export const LEGACY_VARIANT_MAP: Readonly<Record<string, string>> = {
  "solid-light": "soft",
  "no-border": "surface",
  "no-background": "ghost",
  "outline-dark": "tonal",
};

const warnedPairs = new Set<string>();

export function resolveVariant(componentName: string, variant: string): string {
  const canonical = LEGACY_VARIANT_MAP[variant];
  if (!canonical) {
    return variant;
  }

  if (import.meta.env.DEV) {
    const key = `${componentName}:${variant}`;
    if (!warnedPairs.has(key)) {
      warnedPairs.add(key);
      const message = `[${componentName}] variant="${variant}" is deprecated. Use variant="${canonical}" instead.`;
      // eslint-disable-next-line no-console
      console.warn(message);
    }
  }

  return canonical;
}

export function resetWarnedPairs(): void {
  warnedPairs.clear();
}
