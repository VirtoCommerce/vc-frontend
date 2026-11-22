import { effectScope, shallowRef } from "vue";
import { useReducedMotion } from "./reduced-motion";
import type { CustomSectionDirectiveType } from "../types";
import type { EffectScope, ShallowRef } from "vue";

export interface IBehaviorContext {
  /** The attribute's value, bindings resolved; follows the settings. */
  value: Readonly<ShallowRef<string>>;
  /**
   * With `prefers-reduced-motion: reduce` a behavior shows its end state at once. The element mounts afresh when
   * the preference or one of the behavior's options changes, so a behavior reads both once.
   */
  isReducedMotion: boolean;
  /** Counts the element's updates: its children may have changed. */
  updates: Readonly<ShallowRef<number>>;
}

interface IBehaviorState {
  scope: EffectScope;
  value: ShallowRef<string>;
  updates: ShallowRef<number>;
}

/** Runs the setup in an effect scope of its own per element, so what it starts stops when the element goes. */
export function defineBehavior(
  setup: (element: HTMLElement, context: IBehaviorContext) => void,
): CustomSectionDirectiveType {
  const states = new WeakMap<HTMLElement, IBehaviorState>();

  return {
    mounted(element, binding) {
      const state: IBehaviorState = {
        scope: effectScope(true),
        value: shallowRef(binding.value ?? ""),
        updates: shallowRef(0),
      };

      states.set(element, state);
      state.scope.run(() =>
        setup(element, {
          value: state.value,
          isReducedMotion: useReducedMotion().value === "reduce",
          updates: state.updates,
        }),
      );
    },
    updated(element, binding) {
      const state = states.get(element);

      if (state) {
        state.value.value = binding.value ?? "";
        state.updates.value++;
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
