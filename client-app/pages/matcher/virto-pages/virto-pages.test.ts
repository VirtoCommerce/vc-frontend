import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeGetLocalizedPath } from "./test-utils";
import VirtoPages from "./virto-pages.vue";

const { updateLocalizedUrl, useHead, storeUrl } = vi.hoisted(() => ({
  updateLocalizedUrl: vi.fn(),
  useHead: vi.fn(),
  storeUrl: { value: "" },
}));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({
    updateLocalizedUrl,
    getLocalizedPath: fakeGetLocalizedPath,
    defaultStoreCulture: { value: "en-US" },
  }),
}));

vi.mock("@unhead/vue", () => ({ useHead }));

vi.mock("@/core/composables/useBrandProfile", () => ({ useBrandProfile: () => ({ storeUrl }) }));

const pageDocument = {
  id: "en",
  source: "page-builder",
  permalink: "/faq",
  content: "{}",
  alternates: [
    { cultureName: "en-US", permalink: "/faq" },
    { cultureName: "fr-FR", permalink: "/questions" },
  ],
};

function getAlternateLinks() {
  const { link } = useHead.mock.calls.at(-1)![0] as { link: () => { hreflang: string; href: string }[] };
  return link();
}

describe("virto-pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeUrl.value = "https://store.com/";
  });

  it("moves the URL to the permalink of a document that is already loaded on mount", () => {
    // After a language switch the translation resolved for the previous language's permalink arrives with the page.
    shallowMount(VirtoPages, { props: { pageDocument } });

    expect(updateLocalizedUrl).toHaveBeenCalledWith("/faq");
    expect(getAlternateLinks().map((x) => `${x.hreflang} ${new URL(x.href).pathname}`)).toEqual([
      "en-US /faq",
      "fr-FR /fr/questions",
      "x-default /faq",
    ]);
  });

  it("links translations on the configured store host, not the visitor's", () => {
    storeUrl.value = "https://shop.example.com/";

    shallowMount(VirtoPages, { props: { pageDocument } });

    expect(getAlternateLinks().map((x) => new URL(x.href).origin)).toEqual([
      "https://shop.example.com",
      "https://shop.example.com",
      "https://shop.example.com",
    ]);
  });
});
