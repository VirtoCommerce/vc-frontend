/**
 * Resolves a URL against the current origin and returns it only if it stays
 * same-origin, guarding `location` navigations against open-redirect / phishing.
 * Cross-origin, protocol-relative ("//evil.com") and absolute external URLs fall
 * back to `fallback`. Relative paths (e.g. "/account") are preserved.
 */
export function toSameOriginPath(url: string | null | undefined, fallback = "/"): string {
  if (!url) {
    return fallback;
  }

  try {
    const target = new URL(url, location.origin);
    if (target.origin !== location.origin) {
      return fallback;
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
