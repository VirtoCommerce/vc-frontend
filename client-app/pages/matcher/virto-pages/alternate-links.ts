export interface IPageAlternate {
  cultureName: string;
  permalink: string;
}

// A type alias, not an interface: unhead's link type has a `data-*` index signature that only aliases satisfy.
export type AlternateLinkType = {
  rel: "alternate";
  hreflang: string;
  href: string;
};

/**
 * `<link rel="alternate" hreflang>` entries for a page published in several languages, plus `x-default`
 * pointing to the default store language version. A page in a single language gets none.
 */
export function buildAlternateLinks(
  alternates: IPageAlternate[],
  origin: string,
  defaultCultureName: string,
  getLocalizedPath: (cultureName: string, permalink: string) => string,
): AlternateLinkType[] {
  if (alternates.length < 2) {
    return [];
  }

  const links = alternates.map<AlternateLinkType>((alternate) => ({
    rel: "alternate",
    hreflang: alternate.cultureName,
    href: `${origin}${getLocalizedPath(alternate.cultureName, alternate.permalink)}`,
  }));

  const defaultAlternate = alternates.find(
    // eslint-disable-next-line sonarjs/null-dereference -- false positive: typed string parameter
    (alternate) => alternate.cultureName.toLowerCase() === defaultCultureName.toLowerCase(),
  );

  if (defaultAlternate) {
    links.push({
      rel: "alternate",
      hreflang: "x-default",
      href: `${origin}${getLocalizedPath(defaultAlternate.cultureName, defaultAlternate.permalink)}`,
    });
  }

  return links;
}
