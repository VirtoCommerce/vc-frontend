import { createSharedComposable, useMediaQuery, usePreferredReducedMotion } from "@vueuse/core";
import { effectScope, shallowRef } from "vue";
import type { CustomSectionDirectiveType } from "../types";
import type { EffectScope, ShallowRef } from "vue";

export interface IBehaviorContext {
  /** The attribute's value, bindings resolved; follows the settings. */
  value: Readonly<ShallowRef<string>>;
  /** With `prefers-reduced-motion: reduce` a behavior shows its end state at once. */
  isReducedMotion: boolean;
}

/** One media query listener for the page, however many elements behave. */
const useReducedMotion = createSharedComposable(() => usePreferredReducedMotion());

/** As the reduced motion query: shared by every element. */
export const useTouchScreen = createSharedComposable(() => useMediaQuery("(hover: none)"));

interface IBehaviorState {
  scope: EffectScope;
  value: ShallowRef<string>;
}

/** Runs the setup in an effect scope of its own per element, so what it starts stops when the element goes. */
export function defineBehavior(
  setup: (element: HTMLElement, context: IBehaviorContext) => void,
): CustomSectionDirectiveType {
  const states = new WeakMap<HTMLElement, IBehaviorState>();

  return {
    mounted(element, binding) {
      const state: IBehaviorState = { scope: effectScope(true), value: shallowRef(binding.value ?? "") };

      states.set(element, state);
      state.scope.run(() =>
        setup(element, { value: state.value, isReducedMotion: useReducedMotion().value === "reduce" }),
      );
    },
    updated(element, binding) {
      const state = states.get(element);

      if (state) {
        state.value.value = binding.value ?? "";
      }
    },
    unmounted(element) {
      states.get(element)?.scope.stop();
      states.delete(element);
    },
  };
}

/** A boolean attribute: present and not `false`. */
export function readBooleanAttribute(element: HTMLElement, name: string): boolean {
  return element.hasAttribute(name) && element.getAttribute(name) !== "false";
}

/** From the element's computed `direction`, so a `dir` anywhere above it counts. */
export function isRightToLeft(element: HTMLElement): boolean {
  return getComputedStyle(element).direction === "rtl";
}
