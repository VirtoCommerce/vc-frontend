import { readonly, ref } from "vue";
import type { Ref } from "vue";

/**
 * Was the last interaction a pointer or a key?
 *
 * `:focus-visible` answers this for most elements, but Chrome deliberately always matches it on a
 * text input, even for a mouse click — right for a typing target, wrong for a read-only field such
 * as a select trigger, where the focus ring is meant to be keyboard-only.
 *
 * The state is document-wide on purpose. Tracking it per component leaves holes: picking an option
 * with the mouse blurs the trigger, and the focus a closing dropdown hands back is programmatic,
 * so nothing local can tell it apart from a Tab.
 */
const isPointerFocus = ref(false);

let listening = false;

function listen(): void {
  if (listening || typeof document === "undefined") {
    return;
  }

  listening = true;

  // Capture phase: a handler that calls stopPropagation must not be able to hide the modality.
  document.addEventListener("pointerdown", () => (isPointerFocus.value = true), true);
  document.addEventListener("keydown", () => (isPointerFocus.value = false), true);
}

export function useFocusModality(): { isPointerFocus: Readonly<Ref<boolean>> } {
  listen();

  return { isPointerFocus: readonly(isPointerFocus) };
}
