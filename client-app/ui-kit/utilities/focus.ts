export const FOCUSABLE_SELECTOR =
  'a[href]:not([data-skip-autofocus]), button:not(:disabled):not([data-skip-autofocus]), input:not(:disabled):not([data-skip-autofocus]), textarea:not(:disabled):not([data-skip-autofocus]), select:not(:disabled):not([data-skip-autofocus]), [tabindex]:not([tabindex="-1"]):not([data-skip-autofocus]), [contenteditable="true"]:not([data-skip-autofocus])';

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
