const ARROW_STEPS = new Map([
  ["ArrowDown", 1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
  ["ArrowLeft", -1],
]);

/**
 * The item a radio group's arrow, Home or End key moves to (APG radio group, roving focus): the arrows wrap at the
 * ends, and in RTL (read from `container`) Left and Right swap. `undefined` for any other key, for any key pressed
 * with Alt, Ctrl, Meta or Shift (left to the browser: Alt+Left goes back in history) and for a key on an element not
 * in `items`.
 */
export function getRovingFocusTarget(
  event: KeyboardEvent,
  items: HTMLElement[],
  container: HTMLElement,
): HTMLElement | undefined {
  const index = items.indexOf(event.target as HTMLElement);
  const isModified = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  let target: HTMLElement | undefined;

  if (index === -1 || isModified) {
    return target;
  }

  const isHorizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
  const direction = isHorizontal && getComputedStyle(container).direction === "rtl" ? -1 : 1;
  const step = (ARROW_STEPS.get(event.key) ?? 0) * direction;

  if (step) {
    target = items[(index + step + items.length) % items.length];
  } else if (event.key === "Home") {
    target = items[0];
  } else if (event.key === "End") {
    target = items.at(-1);
  }

  return target;
}
