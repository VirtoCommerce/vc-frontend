/**
 * Origin is pinned rather than stubbed, since urls resolve against `location.origin`.
 *
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "https://store.example.com/" }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { MODULE_XAPI_KEYS, MODULE_XFRONTEND_KEYS } from "@/core/constants/modules";
import { toAbsoluteUrl, toIsoCalendarDate, toProfileUrls, useBrandProfile } from "./useBrandProfile";
import { useModuleSettings } from "./useModuleSettings";
import { useThemeContext } from "./useThemeContext";
import { useWhiteLabeling } from "./useWhiteLabeling";

vi.mock("./useThemeContext", () => ({ useThemeContext: vi.fn() }));
vi.mock("./useWhiteLabeling", () => ({ useWhiteLabeling: vi.fn() }));
vi.mock("./useModuleSettings", () => ({ useModuleSettings: vi.fn() }));

const ORIGIN = "https://store.example.com";

type MockOptionsType = {
  storeName?: string;
  storeUrl?: string;
  themeLogoImage?: string;
  whiteLabelingLogoUrl?: string;
  isOrganizationLogoUploaded?: boolean;
  settings?: Record<string, unknown>;
  xapiSettings?: Record<string, unknown>;
};

function mockContext(options: MockOptionsType = {}) {
  vi.mocked(useThemeContext).mockReturnValue({
    themeContext: computed(() => ({
      storeName: options.storeName ?? "Acme Industrial Supply",
      storeUrl: options.storeUrl,
      settings: { logo_image: options.themeLogoImage },
    })),
  } as unknown as ReturnType<typeof useThemeContext>);

  vi.mocked(useWhiteLabeling).mockReturnValue({
    whiteLabelingLogoUrl: ref(options.whiteLabelingLogoUrl),
    isOrganizationLogoUploaded: ref(options.isOrganizationLogoUploaded),
  } as unknown as ReturnType<typeof useWhiteLabeling>);

  const byModule: Record<string, Record<string, unknown>> = {
    [MODULE_XFRONTEND_KEYS.MODULE_ID]: options.settings ?? {},
    [MODULE_XAPI_KEYS.MODULE_ID]: options.xapiSettings ?? {},
  };

  vi.mocked(useModuleSettings).mockImplementation(
    (moduleId: string) =>
      ({
        getSettingValue: (name: string) => byModule[moduleId]?.[name],
      }) as unknown as ReturnType<typeof useModuleSettings>,
  );
}

describe("toAbsoluteUrl", () => {
  it("resolves a root-relative path against the origin", () => {
    expect(toAbsoluteUrl("/assets/logo.svg", ORIGIN)).toBe("https://store.example.com/assets/logo.svg");
  });

  it("resolves a bare filename against the origin", () => {
    expect(toAbsoluteUrl("logo.svg", ORIGIN)).toBe("https://store.example.com/logo.svg");
  });

  it("passes an already-absolute url through", () => {
    expect(toAbsoluteUrl("https://cdn.example.net/logo.svg", ORIGIN)).toBe("https://cdn.example.net/logo.svg");
  });

  it("returns undefined for a blank value", () => {
    expect(toAbsoluteUrl("   ", ORIGIN)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(toAbsoluteUrl(undefined, ORIGIN)).toBeUndefined();
  });

  it("returns undefined rather than throwing on an unparseable value", () => {
    expect(toAbsoluteUrl("http://", ORIGIN)).toBeUndefined();
  });

  it("rejects a non-http scheme, so a javascript: url can never reach the markup", () => {
    expect(toAbsoluteUrl("javascript:alert(1)", ORIGIN)).toBeUndefined();
  });
});

describe("toIsoCalendarDate", () => {
  it("accepts an ISO 8601 calendar date", () => {
    expect(toIsoCalendarDate("1998-04-01")).toBe("1998-04-01");
  });

  it("trims surrounding whitespace", () => {
    expect(toIsoCalendarDate("  1998-04-01  ")).toBe("1998-04-01");
  });

  it.each([
    ["a prose value", "last spring"],
    ["a year only", "1998"],
    ["a US-ordered date", "04/01/1998"],
    ["a datetime", "1998-04-01T00:00:00Z"],
    ["an out-of-range day", "2026-02-30"],
    ["an out-of-range month", "2026-13-01"],
    ["a blank value", "   "],
    ["undefined", undefined],
  ])("rejects %s", (_label, value) => {
    expect(toIsoCalendarDate(value)).toBeUndefined();
  });
});

describe("toProfileUrls", () => {
  it("splits the LongText setting on newlines", () => {
    expect(toProfileUrls("https://x.com/acme\nhttps://linkedin.com/company/acme", ORIGIN)).toEqual([
      "https://x.com/acme",
      "https://linkedin.com/company/acme",
    ]);
  });

  it("tolerates CRLF line endings and blank lines", () => {
    expect(toProfileUrls("https://x.com/acme\r\n\r\n  \r\nhttps://acme.example/about", ORIGIN)).toEqual([
      "https://x.com/acme",
      "https://acme.example/about",
    ]);
  });

  it("deduplicates repeated urls", () => {
    expect(toProfileUrls("https://x.com/acme\nhttps://x.com/acme", ORIGIN)).toEqual(["https://x.com/acme"]);
  });

  it("drops a relative value rather than resolving it against the origin", () => {
    expect(toProfileUrls("/about\nhttps://x.com/acme", ORIGIN)).toEqual(["https://x.com/acme"]);
  });

  it("drops a non-http scheme", () => {
    expect(toProfileUrls("javascript:alert(1)", ORIGIN)).toEqual([]);
  });

  it("returns an empty array for undefined", () => {
    expect(toProfileUrls(undefined, ORIGIN)).toEqual([]);
  });
});

describe("useBrandProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the white labeling logo when it belongs to the store", () => {
    mockContext({ whiteLabelingLogoUrl: "/assets/store-logo.svg", isOrganizationLogoUploaded: false });
    expect(useBrandProfile().storeBrandLogoUrl.value).toBe("https://store.example.com/assets/store-logo.svg");
  });

  it("ignores the white labeling logo when it is the buyer organization's, falling back to the theme default", () => {
    mockContext({
      whiteLabelingLogoUrl: "/assets/buyer-org-logo.svg",
      isOrganizationLogoUploaded: true,
      themeLogoImage: "/assets/theme-logo.svg",
    });
    expect(useBrandProfile().storeBrandLogoUrl.value).toBe("https://store.example.com/assets/theme-logo.svg");
  });

  it("falls back to the theme default when no white labeling logo exists", () => {
    mockContext({ themeLogoImage: "logo.svg" });
    expect(useBrandProfile().storeBrandLogoUrl.value).toBe("https://store.example.com/logo.svg");
  });

  it("leaves the logo undefined when nothing resolves", () => {
    mockContext({});
    expect(useBrandProfile().storeBrandLogoUrl.value).toBeUndefined();
  });

  it("prefers the configured brand logo over white labeling", () => {
    mockContext({
      settings: { [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_LOGO_URL]: "https://cdn.acme.example/brand.svg" },
      whiteLabelingLogoUrl: "/assets/store-logo.svg",
      isOrganizationLogoUploaded: false,
    });
    expect(useBrandProfile().storeBrandLogoUrl.value).toBe("https://cdn.acme.example/brand.svg");
  });

  it("falls through to white labeling when the configured brand logo is blank", () => {
    mockContext({
      settings: { [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_LOGO_URL]: "   " },
      whiteLabelingLogoUrl: "/assets/store-logo.svg",
      isOrganizationLogoUploaded: false,
    });
    expect(useBrandProfile().storeBrandLogoUrl.value).toBe("https://store.example.com/assets/store-logo.svg");
  });

  it("exposes a stable @id anchored on the origin", () => {
    mockContext({});
    expect(useBrandProfile().organizationFacts.value.id).toBe("https://store.example.com/#organization");
  });

  it("prefers the configured store url over the browsing origin", () => {
    mockContext({ storeUrl: "https://www.acme.example/" });
    expect(useBrandProfile().organizationFacts.value.url).toBe("https://www.acme.example/");
  });

  it("falls back to the origin when the store url is unset", () => {
    mockContext({ storeUrl: undefined });
    expect(useBrandProfile().organizationFacts.value.url).toBe("https://store.example.com/");
  });

  // Anything not already http(s) is rejected, never resolved against the browsing origin —
  // resolving would publish the visitor's host as the brand's canonical url.
  it.each([
    ["root-relative", "/shop"],
    ["bare path", "shop"],
    ["non-http scheme", "javascript:alert(1)"],
  ])("falls back to the origin for a %s store url", (_label, storeUrl) => {
    mockContext({ storeUrl });
    expect(useBrandProfile().organizationFacts.value.url).toBe("https://store.example.com/");
  });

  it("normalises an absolute store url that omits the trailing slash", () => {
    mockContext({ storeUrl: "https://www.acme.example" });
    expect(useBrandProfile().organizationFacts.value.url).toBe("https://www.acme.example/");
  });

  it("carries the store name through as the organization name", () => {
    mockContext({ storeName: "Acme Industrial Supply" });
    expect(useBrandProfile().organizationFacts.value.name).toBe("Acme Industrial Supply");
  });

  it("reads the whole brand profile from the module settings", () => {
    mockContext({
      settings: {
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_DESCRIPTION]: "Fasteners and fixings for trade buyers.",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_TAGLINE]: "Industrial supply, next day",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_SAME_AS]: "https://x.com/acme\nhttps://linkedin.com/company/acme",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_SHARE_IMAGE_URL]: "/assets/og-cover.jpg",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_CONTACT_PHONE]: "+1-800-000-0000",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_FOUNDING_DATE]: "1998-04-01",
      },
    });

    const { description, tagline, sameAs, shareImageUrl, contactPhone, foundingDate } = useBrandProfile();

    expect(description.value).toBe("Fasteners and fixings for trade buyers.");
    expect(tagline.value).toBe("Industrial supply, next day");
    expect(sameAs.value).toEqual(["https://x.com/acme", "https://linkedin.com/company/acme"]);
    expect(shareImageUrl.value).toBe("https://store.example.com/assets/og-cover.jpg");
    expect(contactPhone.value).toBe("+1-800-000-0000");
    expect(foundingDate.value).toBe("1998-04-01");
  });

  it("degrades to bare facts when the module is absent, so nothing depends on it being installed", () => {
    mockContext({ settings: {} });

    const { description, tagline, sameAs, shareImageUrl, contactPhone, foundingDate } = useBrandProfile();

    expect(description.value).toBeUndefined();
    expect(tagline.value).toBeUndefined();
    expect(sameAs.value).toEqual([]);
    expect(shareImageUrl.value).toBeUndefined();
    expect(contactPhone.value).toBeUndefined();
    expect(foundingDate.value).toBeUndefined();
  });

  // Every brand profile setting is registered with DefaultValue = string.Empty.
  it("treats the settings' empty-string defaults as unset", () => {
    mockContext({
      settings: {
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_TAGLINE]: "",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_SAME_AS]: "",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_CONTACT_PHONE]: "",
      },
    });

    const { tagline, sameAs, contactPhone } = useBrandProfile();

    expect(tagline.value).toBeUndefined();
    expect(sameAs.value).toEqual([]);
    expect(contactPhone.value).toBeUndefined();
  });

  it.each([
    ["a national-format number", "(800) 555-1234"],
    ["an extension", "+1 800 555 1234 ext. 200"],
    ["prose", "call us"],
  ])("drops %s from the contact phone", (_label, phone) => {
    mockContext({ settings: { [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_CONTACT_PHONE]: phone } });
    expect(useBrandProfile().contactPhone.value).toBeUndefined();
  });

  it("accepts a spaced international number", () => {
    mockContext({ settings: { [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_CONTACT_PHONE]: "+1 (213) 603 3536" } });
    expect(useBrandProfile().contactPhone.value).toBe("+1 (213) 603 3536");
  });

  it("ignores the header's support phone entirely", () => {
    mockContext({ xapiSettings: { [MODULE_XAPI_KEYS.SUPPORT_PHONE_NUMBER]: "+1 (213) 603 3536" } });
    expect(useBrandProfile().contactPhone.value).toBeUndefined();
  });

  it("carries the brand profile into the organization facts", () => {
    mockContext({
      settings: {
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_TAGLINE]: "Industrial supply, next day",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_SAME_AS]: "https://x.com/acme",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_CONTACT_PHONE]: "+1-800-000-0000",
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_FOUNDING_DATE]: "1998-04-01",
      },
    });

    expect(useBrandProfile().organizationFacts.value).toMatchObject({
      tagline: "Industrial supply, next day",
      sameAs: ["https://x.com/acme"],
      contactPhone: "+1-800-000-0000",
      foundingDate: "1998-04-01",
    });
  });

  it("collapses whitespace and newlines in the description", () => {
    mockContext({
      settings: {
        [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_DESCRIPTION]: "  Fasteners and fixings.\n\nNext-day   delivery.  ",
      },
    });
    expect(useBrandProfile().description.value).toBe("Fasteners and fixings. Next-day delivery.");
  });

  it("carries the description into the organization facts", () => {
    mockContext({ settings: { [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_DESCRIPTION]: "Fasteners and fixings." } });
    expect(useBrandProfile().organizationFacts.value).toMatchObject({ description: "Fasteners and fixings." });
  });

  it("keeps the share image out of the organization facts", () => {
    mockContext({ settings: { [MODULE_XFRONTEND_KEYS.BRAND_PROFILE_SHARE_IMAGE_URL]: "/assets/og-cover.jpg" } });
    expect(useBrandProfile().organizationFacts.value).not.toHaveProperty("shareImageUrl");
  });
});
