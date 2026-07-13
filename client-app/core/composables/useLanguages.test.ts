import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setLocale as setLocaleForYup } from "yup";
import { createI18n } from "@/i18n";
import type { ILanguage } from "@/core/types";
import type { I18n } from "@/i18n";

const hoisted = vi.hoisted(() => {
  const enUS: ILanguage = {
    cultureName: "en-US",
    nativeName: "English",
    threeLetterLanguageName: "eng",
    twoLetterLanguageName: "en",
    twoLetterRegionName: "US",
    threeLetterRegionName: "USA",
  };

  const frFR: ILanguage = {
    cultureName: "fr-FR",
    nativeName: "Français",
    threeLetterLanguageName: "fra",
    twoLetterLanguageName: "fr",
    twoLetterRegionName: "FR",
    threeLetterRegionName: "FRA",
  };

  const deDE: ILanguage = {
    cultureName: "de-DE",
    nativeName: "Deutsch",
    threeLetterLanguageName: "deu",
    twoLetterLanguageName: "de",
    twoLetterRegionName: "DE",
    threeLetterRegionName: "DEU",
  };

  const ptBR: ILanguage = {
    cultureName: "pt-BR",
    nativeName: "Português (Brasil)",
    threeLetterLanguageName: "por",
    twoLetterLanguageName: "pt",
    twoLetterRegionName: "BR",
    threeLetterRegionName: "BRA",
  };

  const ptPT: ILanguage = {
    cultureName: "pt-PT",
    nativeName: "Português (Portugal)",
    threeLetterLanguageName: "por",
    twoLetterLanguageName: "pt",
    twoLetterRegionName: "PT",
    threeLetterRegionName: "PRT",
  };

  const themeContext = {
    value: {
      defaultLanguage: enUS,
      availableLanguages: [enUS, frFR, deDE, ptBR, ptPT],
    },
  };

  const contactCultureName = { value: undefined as string | undefined };
  const pinnedLocale = { value: null as string | null };
  const facetsCultureName = { value: "" };
  const previousCultureSlug = {
    value: { cultureName: "", slug: "" },
  };

  return {
    langs: { enUS, frFR, deDE, ptBR, ptPT },
    state: { themeContext, contactCultureName, pinnedLocale, facetsCultureName, previousCultureSlug },
  };
});

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ contactCultureName: hoisted.state.contactCultureName }),
}));

vi.mock("./useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: hoisted.state.themeContext }),
}));

vi.mock("@vueuse/core", () => ({
  useLocalStorage: () => hoisted.state.pinnedLocale,
  noop: () => {},
  useSessionStorage: (key: string) =>
    key === "facetsCultureName" ? hoisted.state.facetsCultureName : hoisted.state.previousCultureSlug,
}));

vi.mock("yup", () => ({
  setLocale: vi.fn(),
}));

function navigateTo(url: string): void {
  history.pushState(null, "", url);
}

async function importComposable() {
  // Always import fresh module state
  const mod = await import("@/core/composables/useLanguages");
  return mod;
}

describe("useLanguages", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    hoisted.state.pinnedLocale.value = null;
    hoisted.state.contactCultureName.value = undefined;
    hoisted.state.facetsCultureName.value = "";
    hoisted.state.previousCultureSlug.value = { cultureName: "", slug: "" };
    navigateTo("/");
    // Reset default language and available languages if modified by a test
    hoisted.state.themeContext.value = {
      defaultLanguage: hoisted.langs.enUS,
      availableLanguages: [
        hoisted.langs.enUS,
        hoisted.langs.frFR,
        hoisted.langs.deDE,
        hoisted.langs.ptBR,
        hoisted.langs.ptPT,
      ],
    };
    document.documentElement.lang = "";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("resolveLocale priority", () => {
    it("prefers full culture from URL when present", async () => {
      navigateTo("/fr-FR/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.resolveLocale()).toBe("fr-FR");
    });

    it("prefers short alias from URL and maps it to culture", async () => {
      navigateTo("/fr/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.resolveLocale()).toBe("fr-FR");
    });

    it("falls back to pinned locale when supported and no URL locale", async () => {
      hoisted.state.pinnedLocale.value = "de-DE";
      navigateTo("/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.resolveLocale()).toBe("de-DE");
    });

    it("falls back to contactCultureName when supported and no URL/pinned", async () => {
      hoisted.state.contactCultureName.value = "fr-FR";
      hoisted.state.pinnedLocale.value = null;
      navigateTo("/");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.resolveLocale()).toBe("fr-FR");
    });

    it("falls back to default store culture when nothing else matches", async () => {
      hoisted.state.contactCultureName.value = "ru-RU"; // unsupported
      hoisted.state.pinnedLocale.value = null;
      navigateTo("/");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.resolveLocale()).toBe("en-US");
    });
  });

  describe("URL helpers", () => {
    it("getLocaleFromUrl detects full culture", async () => {
      navigateTo("/fr-FR/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.getLocaleFromUrl()).toBe("fr-FR");
    });

    it("getLocaleFromUrl detects short alias", async () => {
      navigateTo("/fr/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.getLocaleFromUrl()).toBe("fr");
    });

    it("getLocaleFromUrl returns undefined when no locale is present", async () => {
      navigateTo("/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.getLocaleFromUrl()).toBeUndefined();
    });

    it("getLocaleFromUrl returns undefined when no supported locale is present", async () => {
      navigateTo("/ru-RU/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.getLocaleFromUrl()).toBeUndefined();
    });

    it.each([
      {
        condition: "strips short alias locale prefix and preserves query/hash",
        url: "/fr/cart?x=1#sec",
        expectedPathname: "/cart",
      },
      {
        condition: "strips full locale prefix and preserves query/hash",
        url: "/fr-FR/cart?x=1#sec",
        expectedPathname: "/cart",
      },
      { condition: "does nothing when no locale is present", url: "/cart?x=1#sec", expectedPathname: "/cart" },
      {
        condition: "does nothing when no supported locale is present",
        url: "/ru-RU/cart?x=1#sec",
        expectedPathname: "/ru-RU/cart",
      },
    ])("removeLocaleFromUrl $condition", async ({ url, expectedPathname }) => {
      navigateTo(url);
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.removeLocaleFromUrl();
      expect(location.pathname).toBe(expectedPathname);
      expect(location.search).toBe("?x=1");
      expect(location.hash).toBe("#sec");
    });

    it.each([
      {
        condition: "updates URL with permalink like '/bonjour'",
        url: "/fr/hello?x=1#sec",
        permalink: "/bonjour",
        expectedPathname: "/fr/bonjour",
      },
      {
        condition: "updates URL with permalink like 'bonjour'",
        url: "/fr/hello?x=1#sec",
        permalink: "bonjour",
        expectedPathname: "/fr/bonjour",
      },
      {
        condition: "does nothing when permalink is falsy",
        url: "/fr/cart?x=1#sec",
        permalink: "",
        expectedPathname: "/fr/cart",
      },
      {
        condition: "preserves /loyalty-catalog prefix on slug replace",
        url: "/loyalty-catalog/old-slug?x=1#sec",
        permalink: "/new-slug",
        expectedPathname: "/loyalty-catalog/new-slug",
      },
      {
        condition: "preserves /loyalty-catalog prefix together with locale",
        url: "/fr/loyalty-catalog/old-slug?x=1#sec",
        permalink: "/new-slug",
        expectedPathname: "/fr/loyalty-catalog/new-slug",
      },
    ])("updateLocalizedUrl $condition", async ({ url, permalink, expectedPathname }) => {
      navigateTo(url);
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.updateLocalizedUrl(permalink);
      expect(location.pathname).toBe(expectedPathname);
      expect(location.search).toBe("?x=1");
      expect(location.hash).toBe("#sec");
    });

    it("removeFacetsFromUrl strips the facets param and preserves the rest of the query/hash", async () => {
      navigateTo('/catalog?facets="COLOR":"Red"&page=2#sec');
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.removeFacetsFromUrl();
      expect(location.pathname).toBe("/catalog");
      expect(location.search).toBe("?page=2");
      expect(location.hash).toBe("#sec");
    });

    it("removeFacetsFromUrl does nothing when no facets param is present", async () => {
      navigateTo("/catalog?page=2#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.removeFacetsFromUrl();
      expect(location.pathname).toBe("/catalog");
      expect(location.search).toBe("?page=2");
      expect(location.hash).toBe("#sec");
    });
  });

  describe("URL short alias disambiguation", () => {
    it("does not match 'pt' when both pt-BR and pt-PT are available fallback to default language", async () => {
      navigateTo("/pt/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();

      expect(languages.getLocaleFromUrl()).toBeUndefined();
      expect(languages.resolveLocale()).toBe("en-US");
    });

    it("matches full locales 'pt-BR' and 'pt-PT' when both are available", async () => {
      navigateTo("/pt-BR/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.getLocaleFromUrl()).toBe("pt-BR");
      expect(languages.resolveLocale()).toBe("pt-BR");

      navigateTo("/pt-PT/cart");
      expect(languages.getLocaleFromUrl()).toBe("pt-PT");
      expect(languages.resolveLocale()).toBe("pt-PT");
    });

    it("accepts 'fr' short alias when only fr-FR exists for that language", async () => {
      navigateTo("/fr/cart");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();

      expect(languages.getLocaleFromUrl()).toBe("fr");
      expect(languages.resolveLocale()).toBe("fr-FR");
    });
  });

  describe("initLocale side-effects", () => {
    it("loads messages when missing, sets composer locale and document lang, and normalizes URL for default", async () => {
      navigateTo("/fr-FR/cart");
      const mod = await importComposable();
      const { useLanguages } = mod;
      const languages = useLanguages();

      const i18n: I18n = createI18n("xx-YY", "USD");
      const setMessageSpy = vi.spyOn(i18n.global, "setLocaleMessage");

      await languages.initLocale(i18n, "en-US");

      expect(setMessageSpy).toHaveBeenCalledWith("en-US", expect.any(Object));
      expect(i18n.global.locale.value).toBe("en-US");
      expect(document.documentElement.getAttribute("lang")).toBe("en-US");
      expect(setLocaleForYup).toHaveBeenCalledTimes(1);
      expect(location.pathname).toBe("/cart");
    });

    it("prepends short locale prefix when URL has no locale (VCST-5144)", async () => {
      // /destinations + de must become /de/destinations, not /de/stinations
      navigateTo("/destinations?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      const i18n: I18n = createI18n("en-US", "USD");

      await languages.initLocale(i18n, "de-DE");

      expect(location.pathname).toBe("/de/destinations");
      expect(location.search).toBe("?x=1");
      expect(location.hash).toBe("#sec");
    });

    it.each([
      { condition: "prepends short locale prefix on root path", url: "/", locale: "fr-FR", expectedPathname: "/fr" },
      {
        condition: "replaces full locale with short alias when language has a unique short form",
        url: "/fr-FR/cart",
        locale: "fr-FR",
        expectedPathname: "/fr/cart",
      },
      {
        // pathname starts with `de` but locale prefix is /en-US — must strip only the anchored prefix
        condition: "strips default locale prefix without eating pathname characters",
        url: "/en-US/destinations",
        locale: "en-US",
        expectedPathname: "/destinations",
      },
      {
        // pathname `/destinations` must not be touched when switching to default English
        condition: "does not strip locale-looking substring from pathname when switching to default",
        url: "/destinations",
        locale: "en-US",
        expectedPathname: "/destinations",
      },
    ])("$condition", async ({ url, locale, expectedPathname }) => {
      navigateTo(url);
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      const i18n: I18n = createI18n("en-US", "USD");

      await languages.initLocale(i18n, locale);

      expect(location.pathname).toBe(expectedPathname);
    });

    it("does not modify URL when short locale prefix already matches", async () => {
      navigateTo("/de/destinations?x=1");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      const i18n: I18n = createI18n("en-US", "USD");

      await languages.initLocale(i18n, "de-DE");

      expect(location.pathname).toBe("/de/destinations");
      expect(location.search).toBe("?x=1");
    });

    it("drops facets left over from a different culture (VCST-5324 follow-up)", async () => {
      hoisted.state.facetsCultureName.value = "en-US";
      navigateTo('/catalog?facets="COLOR":"Red"&page=2');
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      const i18n: I18n = createI18n("en-US", "USD");

      await languages.initLocale(i18n, "de-DE");

      expect(location.search).toBe("?page=2");
      expect(hoisted.state.facetsCultureName.value).toBe("de-DE");
    });

    it("keeps facets when the resolved culture matches the one they were built under", async () => {
      hoisted.state.facetsCultureName.value = "de-DE";
      navigateTo('/de/catalog?facets="COLOR":"Red"');
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      const i18n: I18n = createI18n("en-US", "USD");

      await languages.initLocale(i18n, "de-DE");

      expect(location.search).toBe("?facets=%22COLOR%22:%22Red%22");
    });

    it("keeps facets on the very first init (nothing recorded yet to compare against)", async () => {
      navigateTo('/catalog?facets="COLOR":"Red"');
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      const i18n: I18n = createI18n("en-US", "USD");

      await languages.initLocale(i18n, "en-US");

      expect(location.search).toBe("?facets=%22COLOR%22:%22Red%22");
      expect(hoisted.state.facetsCultureName.value).toBe("en-US");
    });
  });

  describe("mergeLocalesMessages", () => {
    it("deep merges new messages over existing", async () => {
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      const i18n: I18n = createI18n("en-US", "USD");
      i18n.global.setLocaleMessage("en-US", { a: { b: 1 }, c: 2 });
      const setSpy = vi.spyOn(i18n.global, "setLocaleMessage");

      languages.mergeLocalesMessages(i18n, "en-US", { a: { d: 3 }, c: 4 });

      expect(setSpy).toHaveBeenLastCalledWith("en-US", {
        a: { b: 1, d: 3 },
        c: 4,
      });
    });
  });

  describe("currentLanguage behavior and pin/unpin", () => {
    it("returns default language before init and selected after init; setter throws", async () => {
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      expect(languages.currentLanguage.value.cultureName).toBe("en-US");

      const i18n: I18n = createI18n("en-US", "USD");
      i18n.global.setLocaleMessage("fr-FR", { some: "msg" });

      await languages.initLocale(i18n, "fr-FR");
      expect(languages.currentLanguage.value.cultureName).toBe("fr-FR");
      expect(() => {
        // Attempt to write to computed through a typed cast to bypass readonly at compile time
        (languages as unknown as { currentLanguage: { value: ILanguage } }).currentLanguage.value = hoisted.langs.deDE;
      }).toThrowError(/read only/);
    });

    it("pinLocale and unpinLocale update pinned storage ref", async () => {
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.pinLocale("fr-FR");
      expect(languages.pinnedLocale.value).toBe("fr-FR");
      languages.unpinLocale();
      expect(languages.pinnedLocale.value).toBeNull();
    });
  });
});
