/** Suffixes a form or test attribute for one endpoint of a range field: `orders` → `orders-start`. */
export function sideAttr(value: string | undefined, side: "start" | "end"): string | undefined {
  return value ? `${value}-${side}` : undefined;
}

/** Narrows a popover trigger's `aria-controls` to the string the a11y attribute needs. */
export function ariaControlsOf(triggerProps: Record<string, unknown>): string | undefined {
  const controls = triggerProps["aria-controls"];
  return typeof controls === "string" ? controls : undefined;
}
