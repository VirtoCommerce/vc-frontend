/** Not `//`, which leaves the site, nor `/\`, which browsers read as `//`. */
const SITE_PATH_REGEX = /^\/(?![/\\])/;
const LINK_SCHEME_REGEX = /^(?:https|mailto|tel):/i;
const ANCHOR_REGEX = /^#[A-Za-z][\w-]*$/;
const ASSET_URL_REGEX = /^https?:\/\//i;
/** Browsers drop these from a URL before reading it, so `/\t/host` would leave the site. */
const URL_NOISE_REGEX = /[\t\n\r\\]/;

/** A link of a custom section: a path on this site, an anchor of the page, or an `https:`, `mailto:` or `tel:` URL. */
export function toSectionLink(value: string): string | undefined {
  const url = value.trim();
  const isAllowed = SITE_PATH_REGEX.test(url) || ANCHOR_REGEX.test(url) || LINK_SCHEME_REGEX.test(url);

  return !URL_NOISE_REGEX.test(url) && isAllowed ? url : undefined;
}

/**
 * An image of a custom section: one of the asset library's, under `assetsBaseUrl`. A theme from a server that
 * does not name the library yet takes a path on this site or an `http(s):` URL.
 */
export function toAssetUrl(value: string, assetsBaseUrl?: string): string | undefined {
  const url = value.trim();
  const isAllowed = assetsBaseUrl
    ? url.startsWith(toFolder(assetsBaseUrl))
    : SITE_PATH_REGEX.test(url) || ASSET_URL_REGEX.test(url);

  return !URL_NOISE_REGEX.test(url) && isAllowed ? url : undefined;
}

/** `undefined` when any candidate breaks the rule: the attribute is left out whole. */
export function toAssetSrcset(value: string, assetsBaseUrl?: string): string | undefined {
  const candidates = value
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  const isSafe =
    candidates.length > 0 && candidates.every((candidate) => !!toAssetUrl(candidate.split(/\s+/)[0], assetsBaseUrl));

  return isSafe ? candidates.join(", ") : undefined;
}

/** `https://cdn/assets` must not admit `https://cdn/assets-of-another-store/`. */
function toFolder(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}
