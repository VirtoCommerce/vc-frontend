export const FOCUSABLE_SELECTOR =
  'a[href]:not([data-skip-autofocus]), button:not(:disabled):not([data-skip-autofocus]), input:not(:disabled):not([data-skip-autofocus]), textarea:not(:disabled):not([data-skip-autofocus]), select:not(:disabled):not([data-skip-autofocus]), [tabindex]:not([tabindex="-1"]):not([data-skip-autofocus]), [contenteditable="true"]:not([data-skip-autofocus])';

const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  "audio[controls]",
  "video[controls]",
  "summary",
  "iframe",
];

/**
 * Roughly the natively focusable elements, `tabindex="-1"` ones included, and any other element with a
 * `tabindex` other than -1.
 */
export const FOCUSABLE_ELEMENT_SELECTOR = FOCUSABLE_ELEMENTS.join(", ");

/** The same elements without `tabindex="-1"`. Other negative values still match; drop them with `hasNegativeTabindex`. */
export const TABBABLE_SELECTOR = FOCUSABLE_ELEMENTS.map((selector) => `${selector}:not([tabindex="-1"])`).join(", ");

/**
 * Whether the `tabindex` attribute keeps the element out of the Tab order, parsed as HTML parses integers:
 * "-0" reads as 0, and a value with no digits after the sign is ignored. The attribute, not `tabIndex`:
 * that reads -1 for a media control or a contenteditable without one.
 */
export function hasNegativeTabindex(element: Element): boolean {
  const match = /^[\t\n\f\r ]*([+-]?\d+)/.exec(element.getAttribute("tabindex") ?? "");
  return !!match && Number(match[1]) < 0;
}

function crossedFocusBoundary(event: FocusEvent): boolean {
  const other = event.relatedTarget;
  const shell = event.currentTarget as HTMLElement | null;
  return !(other instanceof Node && shell?.contains(other));
}

// Read from the shell's own trigger: the body is teleported out, and containment would match any popover.
function ownPopoverBodyId(event: FocusEvent): string {
  const other = event.relatedTarget;
  const shell = event.currentTarget;
  if (!(other instanceof Element) || !(shell instanceof Element)) {
    return "";
  }
  const bodyId = other.closest(".vc-popover__body")?.id;
  if (!bodyId) {
    return "";
  }
  const owned = [...shell.querySelectorAll("[aria-controls]")].some(
    (trigger) => trigger.getAttribute("aria-controls") === bodyId,
  );
  return owned ? bodyId : "";
}

/** `focusin`: focus entered the whole shell. Coming back from its own popover is not an entry. */
export function shellFocusEntered(event: FocusEvent): boolean {
  return !ownPopoverBodyId(event) && crossedFocusBoundary(event);
}

/**
 * `focusout`: where focus went relative to the shell. "own-popover" is not a departure — but the
 * popover body sits outside the shell's subtree, so no later focusout reports the real one either;
 * hand that event to `watchFocusLeavingOwnPopover`.
 */
export function classifyShellFocusOut(event: FocusEvent): "left" | "own-popover" | "internal" {
  if (ownPopoverBodyId(event)) {
    return "own-popover";
  }
  return crossedFocusBoundary(event) ? "left" : "internal";
}

/**
 * Pays back the blur suppressed by an "own-popover" focusout: reports the one moment focus leaves the
 * popover for anywhere outside the shell. A no-op when the popover renders inside the shell — see
 * below. Returns a stop function; call it before starting another watch and on unmount.
 */
export function watchFocusLeavingOwnPopover(event: FocusEvent, onLeft: (blurEvent: FocusEvent) => void): () => void {
  const noop = (): void => {};
  const shell = event.currentTarget;
  const popover = document.getElementById(ownPopoverBodyId(event));
  if (!(shell instanceof Element) || !popover) {
    return noop;
  }
  // Without teleport the departure bubbles to the shell and is classified "left" there; watching would double it.
  if (shell.contains(popover)) {
    return noop;
  }

  const onDocumentFocusOut = (documentEvent: FocusEvent): void => {
    if (!(documentEvent.target instanceof Node) || !popover.contains(documentEvent.target)) {
      return;
    }
    const next = documentEvent.relatedTarget;
    if (next instanceof Node && popover.contains(next)) {
      return;
    }
    // Alt-Tab, devtools, and a click on non-focusable chrome all fire focusout with a null
    // relatedTarget while focus stays put. Reporting it would emit a false blur AND burn this one-shot
    // watch, so the real departure would go unreported.
    if (next === null && !document.hasFocus()) {
      return;
    }
    document.removeEventListener("focusout", onDocumentFocusOut, true);
    if (next instanceof Node && shell.contains(next)) {
      return;
    }
    onLeft(new FocusEvent("blur", { relatedTarget: next }));
  };

  document.addEventListener("focusout", onDocumentFocusOut, true);
  return () => document.removeEventListener("focusout", onDocumentFocusOut, true);
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
