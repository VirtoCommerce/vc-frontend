import { describe, expect, it } from "vitest";
import { buildAlternateLinks } from "./alternate-links";
import { fakeGetLocalizedPath as getLocalizedPath } from "./test-utils";

const origin = "https://store.com";

describe("buildAlternateLinks", () => {
  it("links every translation and the default language as x-default", () => {
    const links = buildAlternateLinks(
      [
        { cultureName: "en-US", permalink: "/faq" },
        { cultureName: "nl-NL", permalink: "/veelgestelde-vragen" },
      ],
      origin,
      "en-US",
      getLocalizedPath,
    );

    expect(links).toEqual([
      { rel: "alternate", hreflang: "en-US", href: "https://store.com/faq" },
      { rel: "alternate", hreflang: "nl-NL", href: "https://store.com/nl/veelgestelde-vragen" },
      { rel: "alternate", hreflang: "x-default", href: "https://store.com/faq" },
    ]);
  });

  it("matches the default language regardless of letter case", () => {
    const links = buildAlternateLinks(
      [
        { cultureName: "en-US", permalink: "/faq" },
        { cultureName: "nl-NL", permalink: "/veelgestelde-vragen" },
      ],
      origin,
      "en-us",
      getLocalizedPath,
    );

    expect(links.at(-1)).toEqual({ rel: "alternate", hreflang: "x-default", href: "https://store.com/faq" });
  });

  it("omits x-default when the default language has no version", () => {
    const links = buildAlternateLinks(
      [
        { cultureName: "nl-NL", permalink: "/veelgestelde-vragen" },
        { cultureName: "de-DE", permalink: "/faq" },
      ],
      origin,
      "en-US",
      getLocalizedPath,
    );

    expect(links.map((link) => link.hreflang)).toEqual(["nl-NL", "de-DE"]);
  });

  it("returns nothing for a page in a single language", () => {
    expect(
      buildAlternateLinks([{ cultureName: "en-US", permalink: "/faq" }], origin, "en-US", getLocalizedPath),
    ).toEqual([]);
  });
});
