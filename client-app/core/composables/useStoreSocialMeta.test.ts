import { useHead } from "@unhead/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useBrandProfile } from "./useBrandProfile";
import { useIsHomePage } from "./useIsHomePage";
import { useStoreSocialMeta } from "./useStoreSocialMeta";

vi.mock("@unhead/vue", () => ({ useHead: vi.fn() }));
vi.mock("./useBrandProfile", () => ({ useBrandProfile: vi.fn() }));
vi.mock("./useIsHomePage", () => ({ useIsHomePage: vi.fn() }));

type MetaEntryType = { property: string; content: string };

const isHomePage = ref(false);

function lastMetaGetter(): () => MetaEntryType[] {
  const input = vi.mocked(useHead).mock.calls.at(-1)?.[0] as { meta: () => MetaEntryType[] };
  return input.meta;
}

type BrandOptionsType = {
  storeName?: string;
  tagline?: string;
  description?: string;
  shareImageUrl?: string;
};

function mockBrand(options: BrandOptionsType = {}) {
  vi.mocked(useBrandProfile).mockReturnValue({
    storeName: computed(() => options.storeName),
    tagline: computed(() => options.tagline),
    description: computed(() => options.description),
    shareImageUrl: computed(() => options.shareImageUrl),
  } as unknown as ReturnType<typeof useBrandProfile>);
}

describe("useStoreSocialMeta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isHomePage.value = false;
    vi.mocked(useIsHomePage).mockReturnValue(computed(() => isHomePage.value));
  });

  it("emits og:site_name from the store name", () => {
    mockBrand({ storeName: "Acme Industrial Supply" });
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toEqual([{ property: "og:site_name", content: "Acme Industrial Supply" }]);
  });

  it("emits nothing when the store name is unavailable", () => {
    mockBrand();
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toEqual([]);
  });

  it("emits nothing when the store name is blank", () => {
    mockBrand({ storeName: "   " });
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toEqual([]);
  });

  it("re-evaluates the getter, so it reacts to a store name resolved after setup", () => {
    const source = ref<string | undefined>(undefined);
    vi.mocked(useBrandProfile).mockReturnValue({
      storeName: computed(() => source.value),
      tagline: computed(() => undefined),
      description: computed(() => undefined),
      shareImageUrl: computed(() => undefined),
    } as unknown as ReturnType<typeof useBrandProfile>);

    useStoreSocialMeta();
    const meta = lastMetaGetter();
    expect(meta()).toEqual([]);

    source.value = "Acme";
    expect(meta()).toEqual([{ property: "og:site_name", content: "Acme" }]);
  });

  it("emits og:image from the share image on any page", () => {
    mockBrand({ storeName: "Acme", shareImageUrl: "https://store.example.com/og-cover.jpg" });
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toContainEqual({
      property: "og:image",
      content: "https://store.example.com/og-cover.jpg",
    });
  });

  it("omits og:image when no share image is configured", () => {
    mockBrand({ storeName: "Acme" });
    useStoreSocialMeta();
    expect(lastMetaGetter()().map((tag) => tag.property)).not.toContain("og:image");
  });

  it("emits og:description from the store description on any page", () => {
    mockBrand({ storeName: "Acme", description: "Fasteners and fixings for trade buyers." });
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toContainEqual({
      property: "og:description",
      content: "Fasteners and fixings for trade buyers.",
    });
  });

  it("omits og:description when no store description is configured", () => {
    mockBrand({ storeName: "Acme" });
    useStoreSocialMeta();
    expect(lastMetaGetter()().map((tag) => tag.property)).not.toContain("og:description");
  });

  it("emits the name — tagline og:title on the homepage", () => {
    isHomePage.value = true;
    mockBrand({ storeName: "Acme", tagline: "Industrial supply, next day" });
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toContainEqual({
      property: "og:title",
      content: "Acme — Industrial supply, next day",
    });
  });

  it("omits og:title away from the homepage", () => {
    mockBrand({ storeName: "Acme", tagline: "Industrial supply, next day" });
    useStoreSocialMeta();
    expect(lastMetaGetter()().map((tag) => tag.property)).not.toContain("og:title");
  });

  it("omits og:title on the homepage when no tagline is configured", () => {
    isHomePage.value = true;
    mockBrand({ storeName: "Acme" });
    useStoreSocialMeta();
    expect(lastMetaGetter()().map((tag) => tag.property)).not.toContain("og:title");
  });

  it("drops og:title on navigation away from the homepage", () => {
    isHomePage.value = true;
    mockBrand({ storeName: "Acme", tagline: "Industrial supply, next day" });
    useStoreSocialMeta();
    const meta = lastMetaGetter();
    expect(meta().map((tag) => tag.property)).toContain("og:title");

    isHomePage.value = false;
    expect(meta().map((tag) => tag.property)).not.toContain("og:title");
  });
});
