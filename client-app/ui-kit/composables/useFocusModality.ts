import { createGlobalState, useEventListener } from "@vueuse/core";
import { readonly, ref } from "vue";
import type { Ref } from "vue";

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "AltGraph", "Meta"]);

// A modifier alone or a Cmd/Ctrl shortcut (copy, a screenshot) moves no focus, as in React Aria.
function movesFocus(event: KeyboardEvent): boolean {
  return !MODIFIER_KEYS.has(event.key) && !event.metaKey && !event.ctrlKey;
}

/**
 * Whether the last interaction was a pointer rather than a key. Chrome matches `:focus-visible` on
 * a text input even for a click, which a read-only select trigger must not ring for. Document-wide,
 * because the focus a closing dropdown hands back is programmatic and looks like a Tab locally.
 */
function _useFocusModalityState(): Readonly<Ref<boolean>> {
  const isPointerFocus = ref(false);

  // Capture phase: a handler that calls stopPropagation must not be able to hide the modality.
  useEventListener(globalThis.document, "pointerdown", () => (isPointerFocus.value = true), { capture: true });
  useEventListener(
    globalThis.document,
    "keydown",
    (event: KeyboardEvent) => {
      if (movesFocus(event)) {
        isPointerFocus.value = false;
      }
    },
    { capture: true },
  );

  return readonly(isPointerFocus);
}

// Created on first use, not on import: tests that mock `@vueuse/core` without `createGlobalState` still import the kit.
let useFocusModalityState: (() => Readonly<Ref<boolean>>) | undefined;

export function useFocusModality(): { isPointerFocus: Readonly<Ref<boolean>> } {
  useFocusModalityState ??= createGlobalState(_useFocusModalityState);

  return { isPointerFocus: useFocusModalityState() };
}
