/**
 * A key pressed inside an IME composition (Japanese, Chinese, Korean input): it picks or commits a
 * candidate, so a listbox must not act on it. Safari reports the commit Enter with keyCode 229 only.
 */
export function isComposingKey(event: KeyboardEvent): boolean {
  return event.isComposing || event.keyCode === 229;
}
