/** Not `//`, which leaves the site, nor `/\`, which browsers read as `//`. */
const SITE_PATH_REGEX = /^\/(?![/\\])/;
const LINK_SCHEME_REGEX = /^(?:https|mailto|tel):/i;
const ASSET_URL_REGEX = /^https?:\/\//i;
/** Browsers drop these from a URL before reading it, so `/\t/host` would leave the site. */
const URL_NOISE_REGEX = /[\t\n\r\\]/;

/** A link of a custom section: a path on this site, or an `https:`, `mailto:` or `tel:` URL. */
export function toSectionLink(value: string): string | undefined {
  const url = value.trim();

  return !URL_NOISE_REGEX.test(url) && (SITE_PATH_REGEX.test(url) || LINK_SCHEME_REGEX.test(url)) ? url : undefined;
}

/** An image of a custom section: a path on this site or an `http(s):` URL, as the asset library gives them. */
export function toAssetUrl(value: string): string | undefined {
  const url = value.trim();

  return !URL_NOISE_REGEX.test(url) && (SITE_PATH_REGEX.test(url) || ASSET_URL_REGEX.test(url)) ? url : undefined;
}

/** `undefined` when any candidate breaks the rule: the attribute is left out whole. */
export function toAssetSrcset(value: string): string | undefined {
  const candidates = value
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  const isSafe = candidates.length > 0 && candidates.every((candidate) => !!toAssetUrl(candidate.split(/\s+/)[0]));

  return isSafe ? candidates.join(", ") : undefined;
}
