import { readonly, ref } from "vue";
import type { Ref } from "vue";

/**
 * Whether the last interaction was a pointer rather than a key. Chrome matches `:focus-visible` on
 * a text input even for a click, which a read-only select trigger must not ring for. Document-wide,
 * because the focus a closing dropdown hands back is programmatic and looks like a Tab locally.
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
