/** Stand-in for `useLanguages().getLocalizedPath` with `en-US` as the default store language. */
export function fakeGetLocalizedPath(cultureName: string, permalink: string): string {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: typed string parameter
  return cultureName.toLowerCase() === "en-us" ? permalink : `/${cultureName.slice(0, 2)}${permalink}`;
}
