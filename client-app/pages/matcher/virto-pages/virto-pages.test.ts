import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import VirtoPages from "./virto-pages.vue";

const { updateLocalizedUrl, useHead, themeContext } = vi.hoisted(() => ({
  updateLocalizedUrl: vi.fn(),
  useHead: vi.fn(),
  themeContext: { value: { storeUrl: "" } },
}));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({
    updateLocalizedUrl,
    getLocalizedPath: (cultureName: string, permalink: string) =>
      // eslint-disable-next-line sonarjs/null-dereference -- false positive: typed string parameter
      cultureName === "en-US" ? permalink : `/${cultureName.slice(0, 2)}${permalink}`,
    defaultStoreCulture: { value: "en-US" },
  }),
}));

vi.mock("@unhead/vue", () => ({ useHead }));

vi.mock("@/core/composables/useThemeContext", () => ({ useThemeContext: () => ({ themeContext }) }));

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
  it("moves the URL to the permalink of a document that is already loaded on mount", () => {
    // After a language switch the translation resolved for the previous language's permalink arrives with the page.
    shallowMount(VirtoPages, {
      props: {
        pageDocument: {
          id: "en",
          source: "page-builder",
          permalink: "/faq",
          content: "{}",
          alternates: [
            { cultureName: "en-US", permalink: "/faq" },
            { cultureName: "fr-FR", permalink: "/questions" },
          ],
        },
      },
    });

    expect(updateLocalizedUrl).toHaveBeenCalledWith("/faq");

    const { link } = useHead.mock.calls[0][0] as { link: () => { hreflang: string; href: string }[] };
    expect(link().map((x) => `${x.hreflang} ${new URL(x.href).pathname}`)).toEqual([
      "en-US /faq",
      "fr-FR /fr/questions",
      "x-default /faq",
    ]);
  });

  it("links translations on the configured store host, not the visitor's", () => {
    themeContext.value.storeUrl = "https://shop.example.com/";

    shallowMount(VirtoPages, { props: { pageDocument } });

    expect(getAlternateLinks().map((x) => new URL(x.href).origin)).toEqual([
      "https://shop.example.com",
      "https://shop.example.com",
      "https://shop.example.com",
    ]);
    themeContext.value.storeUrl = "";
  });
});
