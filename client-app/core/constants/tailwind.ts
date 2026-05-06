/** @deprecated Use `BREAKPOINTS` from `@/ui-kit/constants` instead */
export const BREAKPOINTS = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1500px",
} as const;

/** @deprecated Use `BreakpointsType` from `@/ui-kit/constants` instead */
export type BreakpointsType = keyof typeof BREAKPOINTS;
