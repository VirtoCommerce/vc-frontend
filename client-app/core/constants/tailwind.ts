export const BREAKPOINTS = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1500px",
} as const;

export type BreakpointsType = keyof typeof BREAKPOINTS;
