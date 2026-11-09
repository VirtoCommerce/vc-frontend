import type { InjectionKey } from "vue";

// Provided by every VcFrame: a frame that injects it is nested, and warns in development.
export const vcFrameKey: InjectionKey<true> = Symbol("vc-frame-context");
