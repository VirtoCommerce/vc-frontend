export const FOCUSABLE_SELECTOR =
  'a[href]:not([data-skip-autofocus]), button:not(:disabled):not([data-skip-autofocus]), input:not(:disabled):not([data-skip-autofocus]), textarea:not(:disabled):not([data-skip-autofocus]), select:not(:disabled):not([data-skip-autofocus]), [tabindex]:not([tabindex="-1"]):not([data-skip-autofocus]), [contenteditable="true"]:not([data-skip-autofocus]), .vc-select__container';

export function findFirstFocusableElement(
  container: HTMLElement | string,
  focusableToExcludeSelector?: string,
): HTMLElement | null {
  const element = typeof container === "string" ? document.querySelector(container) : container;

  if (!element || !(element instanceof HTMLElement)) {
    return null;
  }

  const focusableElement = element.querySelector(FOCUSABLE_SELECTOR) as HTMLElement;
  const elementsToExclude = focusableToExcludeSelector
    ? (element.querySelector(focusableToExcludeSelector) as HTMLElement)
    : null;

  if (elementsToExclude === focusableElement) {
    return null;
  }

  return focusableElement || null;
}

export function focusFirstElement(container: HTMLElement | string, focusableToExcludeSelector?: string): boolean {
  const element = findFirstFocusableElement(container, focusableToExcludeSelector);
  if (element) {
    element.focus();
    return true;
  }

  return false;
}
