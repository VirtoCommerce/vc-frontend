import { onUnmounted } from "vue";
import { classifyShellFocusOut, shellFocusEntered, watchFocusLeavingOwnPopover } from "@/ui-kit/utilities/focus";

interface IShellFocusEmit {
  (event: "focus", focusEvent: FocusEvent): void;
  (event: "blur", focusEvent: FocusEvent): void;
}

/**
 * focusin/focusout wiring for a shell that owns a popover: moving focus into that popover is not a
 * departure, and the one real departure is reported exactly once. A teleported popover sits outside
 * the shell's subtree, so a document watch reports it; one rendered inside reports it by bubbling.
 */
export function useShellFocusEvents(emit: IShellFocusEmit): {
  onFocusIn: (event: FocusEvent) => void;
  onFocusOut: (event: FocusEvent) => void;
} {
  let stopPopoverFocusWatch: (() => void) | undefined;
  onUnmounted(() => stopPopoverFocusWatch?.());

  function onFocusIn(event: FocusEvent): void {
    if (shellFocusEntered(event)) {
      emit("focus", event);
    }
  }

  function onFocusOut(event: FocusEvent): void {
    const exit = classifyShellFocusOut(event);
    if (exit === "left") {
      emit("blur", event);
      return;
    }
    if (exit === "own-popover") {
      stopPopoverFocusWatch?.();
      stopPopoverFocusWatch = watchFocusLeavingOwnPopover(event, (blurEvent) => emit("blur", blurEvent));
    }
  }

  return { onFocusIn, onFocusOut };
}
