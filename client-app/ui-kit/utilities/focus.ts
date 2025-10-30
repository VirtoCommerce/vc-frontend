export const FOCUSABLE_SELECTOR =
  "input:not(:disabled):not(.vc-dialog-header__close), button:not(:disabled):not(.vc-dialog-header__close)";

export function findFirstFocusableElement(container: HTMLElement | string): HTMLElement | null {
  const element = typeof container === "string" ? document.querySelector(container) : container;

  if (!element || !(element instanceof HTMLElement)) {
    return null;
  }

  const focusableElement = element.querySelector(FOCUSABLE_SELECTOR) as HTMLElement;
  return focusableElement || null;
}

export function focusFirstElement(container: HTMLElement | string): boolean {
  const element = findFirstFocusableElement(container);
  if (element) {
    element.focus();
    return true;
  }

  return false;
}
