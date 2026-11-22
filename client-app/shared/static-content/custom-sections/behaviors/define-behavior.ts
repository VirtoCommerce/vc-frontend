import { effectScope, shallowRef } from "vue";
import { isBooleanAttributeOn } from "../allowlist";
import { useReducedMotion } from "../composables/useReducedMotion";
import type { CustomSectionDirectiveType } from "../types";
import type { EffectScope, ShallowRef } from "vue";

/** The element mounts afresh when its value, one of its options or the motion preference changes. */
export interface IBehaviorContext {
  /** The attribute's value, bindings resolved. */
  value: string;
  /** With `prefers-reduced-motion: reduce` a behavior shows its end state at once. */
  isReducedMotion: boolean;
  /** Counts the element's updates: its children may have changed. */
  updates: Readonly<ShallowRef<number>>;
}

interface IBehaviorState {
  scope: EffectScope;
  updates: ShallowRef<number>;
}

/**
 * The directive of a behavior, as the built-ins make theirs. `setup` runs from `mounted` inside an effect scope of
 * the element's own, which stops on unmount: a watcher, or a listener a VueUse composable adds, ends with the
 * element. The context reads the value and the visitor's motion preference.
 */
export function defineBehavior(
  setup: (element: HTMLElement, context: IBehaviorContext) => void,
): CustomSectionDirectiveType {
  const states = new WeakMap<HTMLElement, IBehaviorState>();

  return {
    mounted(element, binding) {
      const state: IBehaviorState = { scope: effectScope(true), updates: shallowRef(0) };

      states.set(element, state);
      state.scope.run(() =>
        setup(element, {
          value: binding.value ?? "",
          isReducedMotion: useReducedMotion().value === "reduce",
          updates: state.updates,
        }),
      );
    },
    updated(element) {
      const state = states.get(element);

      if (state) {
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
  return element.hasAttribute(name) && isBooleanAttributeOn(element.getAttribute(name) ?? "");
}

/** From the element's computed `direction`, so a `dir` anywhere above it counts. */
export function isRightToLeft(element: HTMLElement): boolean {
  return getComputedStyle(element).direction === "rtl";
}
