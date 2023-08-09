import "@vueuse/core";

export {};

declare module "@vueuse/core" {
  /** @deprecated Use `BREAKPOINTS` from `import { BREAKPOINTS } from "@/core/constants"` instead */
  declare const breakpointsTailwind;
}
