export const FOCUSABLE_SELECTOR =
  'a[href]:not([data-skip-autofocus]), button:not(:disabled):not([data-skip-autofocus]), input:not(:disabled):not([data-skip-autofocus]), textarea:not(:disabled):not([data-skip-autofocus]), select:not(:disabled):not([data-skip-autofocus]), [tabindex]:not([tabindex="-1"]):not([data-skip-autofocus]), [contenteditable="true"]:not([data-skip-autofocus])';

function crossedFocusBoundary(event: FocusEvent): boolean {
  const other = event.relatedTarget;
  const shell = event.currentTarget as HTMLElement | null;
  return !(other instanceof Node && shell?.contains(other));
}

// Ownership is read from the shell's own trigger(s): the popover body is teleported out of the shell's
// subtree, and mere containment would also match an unrelated popover opened elsewhere on the page.
function focusMovedIntoOwnPopover(event: FocusEvent): boolean {
  const other = event.relatedTarget;
  const shell = event.currentTarget;
  if (!(other instanceof Element) || !(shell instanceof Element)) {
    return false;
  }
  const bodyId = other.closest(".vc-popover__body")?.id;
  if (!bodyId) {
    return false;
  }
  return [...shell.querySelectorAll("[aria-controls]")].some(
    (trigger) => trigger.getAttribute("aria-controls") === bodyId,
  );
}

/** `focusin`: focus entered the whole shell, not just moved between its inner controls. */
export function shellFocusEntered(event: FocusEvent): boolean {
  return crossedFocusBoundary(event);
}

/**
 * `focusout`: focus left the whole shell. Moving into a popover the shell itself owns (its calendar)
 * is not leaving; the shell's own controls and any other popover on the page are.
 */
export function shellFocusLeft(event: FocusEvent): boolean {
  return !focusMovedIntoOwnPopover(event) && crossedFocusBoundary(event);
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
