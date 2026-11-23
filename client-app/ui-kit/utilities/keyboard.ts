/**
 * A key pressed inside an IME composition (Japanese, Chinese, Korean input): it picks or commits a
 * candidate, so a listbox must not act on it. Safari reports the commit Enter with keyCode 229 only.
 */
export function isComposingKey(event: KeyboardEvent): boolean {
  // eslint-disable-next-line sonarjs/deprecation -- Safari reports the IME commit Enter only as keyCode 229
  return event.isComposing || event.keyCode === 229;
}
