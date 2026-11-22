/** Not `//`, which leaves the site, nor `/\`, which browsers read as `//`. */
const SITE_PATH_REGEX = /^\/(?![/\\])/;
const LINK_SCHEME_REGEX = /^(?:https|mailto|tel):/i;
const ANCHOR_REGEX = /^#[A-Za-z][\w-]*$/;
/** An escaped dot or slash could step out of the library once the server or the browser decodes it. */
const ESCAPED_PATH_REGEX = /%(?:2e|2f|5c)/i;
/** Not JavaScript's `\s`, which also takes U+00A0 and the like: those stay inside a URL. */
const ASCII_WHITESPACE_REGEX = /[\t\n\f\r ]+/;
const ASCII_WHITESPACE = new Set(["\t", "\n", "\f", "\r", " "]);
/** Browsers drop these from a URL before reading it, so `/\t/host` would leave the site. */
const URL_NOISE_REGEX = /[\t\n\r\\]/;

/** A link of a custom section: a path on this site, an anchor of the page, or an `https:`, `mailto:` or `tel:` URL. */
export function toSectionLink(value: string): string | undefined {
  const url = trimAsciiWhitespace(value);
  const isAllowed = SITE_PATH_REGEX.test(url) || ANCHOR_REGEX.test(url) || LINK_SCHEME_REGEX.test(url);

  return !URL_NOISE_REGEX.test(url) && isAllowed ? url : undefined;
}

/**
 * An image of a custom section: one of the asset library's, under `assetsBaseUrl` once `..` resolves, as the
 * server reads it. Without the base, no image.
 */
export function toAssetUrl(value: string, assetsBaseUrl: string | undefined): string | undefined {
  const url = trimAsciiWhitespace(value);

  if (!assetsBaseUrl || URL_NOISE_REGEX.test(url) || ESCAPED_PATH_REGEX.test(url)) {
    return undefined;
  }

  const href = resolveUrl(url);
  const folder = resolveUrl(toFolder(assetsBaseUrl));

  return href && folder && href.startsWith(folder) ? url : undefined;
}

/**
 * `undefined` when any candidate breaks the rule: the attribute is left out whole. A candidate splits on ASCII
 * whitespace only, as the browser reads it, and is written back as it was checked.
 */
export function toAssetSrcset(value: string, assetsBaseUrl: string | undefined): string | undefined {
  const candidates = value
    .split(",")
    .map((candidate) => candidate.split(ASCII_WHITESPACE_REGEX).filter(Boolean))
    .filter((parts) => parts.length > 0);
  const safeCandidates = candidates.map(([url, ...descriptors]) => {
    const safeUrl = toAssetUrl(url, assetsBaseUrl);
    return safeUrl === undefined ? undefined : [safeUrl, ...descriptors].join(" ");
  });

  return safeCandidates.length > 0 && safeCandidates.every((candidate) => candidate !== undefined)
    ? safeCandidates.join(", ")
    : undefined;
}

/** `https://cdn/assets` must not admit `https://cdn/assets-of-another-store/`. */
function toFolder(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function resolveUrl(url: string): string | undefined {
  try {
    return new URL(url, document.baseURI).href;
  } catch {
    return undefined;
  }
}

/** As the URL parser and CSS trim: U+00A0 and the like stay, and make the URL another one. */
export function trimAsciiWhitespace(value: string): string {
  let start = 0;
  let end = value.length;

  while (start < end && ASCII_WHITESPACE.has(value[start])) {
    start++;
  }

  while (end > start && ASCII_WHITESPACE.has(value[end - 1])) {
    end--;
  }

  return value.slice(start, end);
}
