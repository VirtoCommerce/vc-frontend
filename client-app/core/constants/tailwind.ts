/** @deprecated Use `BREAKPOINTS` from `@/ui-kit/constants` instead */
export const BREAKPOINTS = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
  "3xl": "1600px",
  "4xl": "1920px",
} as const;

/** @deprecated Use `BreakpointsType` from `@/ui-kit/constants` instead */
export type BreakpointsType = keyof typeof BREAKPOINTS;
