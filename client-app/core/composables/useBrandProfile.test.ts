/**
 * `useBrandProfile` absolutises urls against `location.origin`, so pin the document origin
 * instead of stubbing globals.
 *
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "https://store.example.com/" }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { toAbsoluteUrl, useBrandProfile } from "./useBrandProfile";
import { useThemeContext } from "./useThemeContext";
import { useWhiteLabeling } from "./useWhiteLabeling";

vi.mock("./useThemeContext", () => ({ useThemeContext: vi.fn() }));
vi.mock("./useWhiteLabeling", () => ({ useWhiteLabeling: vi.fn() }));

const ORIGIN = "https://store.example.com";

type MockOptionsType = {
  storeName?: string;
  storeUrl?: string;
  themeLogoImage?: string;
  whiteLabelingLogoUrl?: string;
  isOrganizationLogoUploaded?: boolean;
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

  it("carries the store name through as the organization name", () => {
    mockContext({ storeName: "Acme Industrial Supply" });
    expect(useBrandProfile().organizationFacts.value.name).toBe("Acme Industrial Supply");
  });
});
