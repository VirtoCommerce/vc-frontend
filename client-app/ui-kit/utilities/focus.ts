export const FOCUSABLE_SELECTOR =
  'a[href]:not([data-skip-autofocus]), button:not(:disabled):not([data-skip-autofocus]), input:not(:disabled):not([data-skip-autofocus]), textarea:not(:disabled):not([data-skip-autofocus]), select:not(:disabled):not([data-skip-autofocus]), [tabindex]:not([tabindex="-1"]):not([data-skip-autofocus]), [contenteditable="true"]:not([data-skip-autofocus])';

/** True when focus entered or left the whole shell, not just moved between its inner controls. */
export function crossedFocusBoundary(event: FocusEvent): boolean {
  const other = event.relatedTarget;
  const shell = event.currentTarget as HTMLElement | null;
  return !(other instanceof Node && shell?.contains(other));
}

export function findFirstFocusableElement(
  container: HTMLElement | string,
  { ignoreSelector, extendSelector }: { ignoreSelector?: string; extendSelector?: string },
): HTMLElement | null {
  const element = typeof container === "string" ? document.querySelector(container) : container;

  if (!element || !(element instanceof HTMLElement)) {
    return null;
  }

  const selectors = [FOCUSABLE_SELECTOR, extendSelector].filter(Boolean).join(", ");

  const focusableElement = element.querySelector(selectors) as HTMLElement;
  const elementsToExclude = ignoreSelector ? (element.querySelector(ignoreSelector) as HTMLElement) : null;

  if (elementsToExclude === focusableElement) {
    return null;
  }

  return focusableElement || null;
}

export function focusFirstElement(
  container: HTMLElement | string,
  { ignoreSelector, extendSelector }: { ignoreSelector?: string; extendSelector?: string },
): boolean {
  const element = findFirstFocusableElement(container, { ignoreSelector, extendSelector });

  if (element) {
    element.focus();
    return true;
  }

  return false;
}
