import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { usePermalinkSeo } from "./usePermalinkSeo";

const head = vi.hoisted(() => ({
  link: undefined as (() => unknown) | undefined,
  ogUrl: undefined as (() => unknown) | undefined,
}));

vi.mock("@unhead/vue", () => ({
  useHead: (input: { link: () => unknown }) => {
    head.link = input.link;
  },
  useSeoMeta: (input: { ogUrl: () => unknown }) => {
    head.ogUrl = input.ogUrl;
  },
}));
vi.mock("@/core/composables/useBrandProfile", () => ({
  useBrandProfile: () => ({ storeUrl: ref("https://shop.example.com/") }),
}));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({
    currentLanguage: ref({ cultureName: "de-DE" }),
    getLocalizedPath: (cultureName: string, permalink: string) => `/${cultureName.slice(0, 2)}${permalink}`,
  }),
}));

describe("usePermalinkSeo", () => {
  it("gives search engines the store's host and the localized permalink, without the visited query", () => {
    window.history.replaceState(null, "", "/de/landing?utm_source=mail&ep=https://admin.example.com");

    const { pageUrl } = usePermalinkSeo("/landing", true);

    expect(pageUrl.value).toBe("https://shop.example.com/de/landing");
    expect(head.ogUrl?.()).toBe("https://shop.example.com/de/landing");
    expect(head.link?.()).toEqual([{ rel: "canonical", href: "https://shop.example.com/de/landing" }]);
  });

  it("sets nothing while it is off", () => {
    usePermalinkSeo("/landing", false);

    expect(head.ogUrl?.()).toBeUndefined();
    expect(head.link?.()).toEqual([]);
  });
});
