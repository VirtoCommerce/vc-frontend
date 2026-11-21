import { usePreferredReducedMotion } from "@vueuse/core";
import { effectScope, shallowRef } from "vue";
import type { CustomSectionDirectiveType } from "../types";
import type { EffectScope, ShallowRef } from "vue";

export interface IBehaviorContext {
  /** The attribute's value, bindings resolved; follows the settings. */
  value: Readonly<ShallowRef<string>>;
  /** With `prefers-reduced-motion: reduce` a behavior shows its end state at once. */
  isReducedMotion: boolean;
}

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
        setup(element, { value: state.value, isReducedMotion: usePreferredReducedMotion().value === "reduce" }),
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

/** A number attribute within its range; `undefined` when absent or not a number. */
export function readNumberAttribute(element: HTMLElement, name: string, min: number, max: number): number | undefined {
  const text = element.getAttribute(name)?.trim();
  const value = text ? Number(text) : Number.NaN;

  return Number.isFinite(value) ? clamp(value, min, max) : undefined;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
