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

  return {
    langs: { enUS, frFR, deDE, ptBR, ptPT },
    state: { themeContext, contactCultureName, pinnedLocale },
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
}));

vi.mock("yup", () => ({
  setLocale: vi.fn(),
}));

function navigateTo(url: string): void {
  window.history.pushState(null, "", url);
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

    it("removeLocaleFromUrl strips short alias locale prefix and preserves query/hash", async () => {
      navigateTo("/fr/cart?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.removeLocaleFromUrl();
      expect(window.location.pathname).toBe("/cart");
      expect(window.location.search).toBe("?x=1");
      expect(window.location.hash).toBe("#sec");
    });

    it("removeLocaleFromUrl strips full locale prefix and preserves query/hash", async () => {
      navigateTo("/fr-FR/cart?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.removeLocaleFromUrl();
      expect(window.location.pathname).toBe("/cart");
      expect(window.location.search).toBe("?x=1");
      expect(window.location.hash).toBe("#sec");
    });

    it("removeLocaleFromUrl does nothing when no locale is present", async () => {
      navigateTo("/cart?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.removeLocaleFromUrl();
      expect(window.location.pathname).toBe("/cart");
      expect(window.location.search).toBe("?x=1");
      expect(window.location.hash).toBe("#sec");
    });

    it("removeLocaleFromUrl does nothing when no supported locale is present", async () => {
      navigateTo("/ru-RU/cart?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.removeLocaleFromUrl();
      expect(window.location.pathname).toBe("/ru-RU/cart");
      expect(window.location.search).toBe("?x=1");
      expect(window.location.hash).toBe("#sec");
    });

    it("updateLocalizedUrl updates URL with permalink like '/bonjour'", async () => {
      navigateTo("/fr/hello?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.updateLocalizedUrl("/bonjour");
      expect(window.location.pathname).toBe("/fr/bonjour");
      expect(window.location.search).toBe("?x=1");
      expect(window.location.hash).toBe("#sec");
    });

    it("updateLocalizedUrl updates URL with permalink like 'bonjour'", async () => {
      navigateTo("/fr/hello?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.updateLocalizedUrl("bonjour");
      expect(window.location.pathname).toBe("/fr/bonjour");
      expect(window.location.search).toBe("?x=1");
      expect(window.location.hash).toBe("#sec");
    });

    it("updateLocalizedUrl does nothing when permalink is falsy", async () => {
      navigateTo("/fr/cart?x=1#sec");
      const { useLanguages } = await importComposable();
      const languages = useLanguages();
      languages.updateLocalizedUrl("");
      expect(window.location.pathname).toBe("/fr/cart");
      expect(window.location.search).toBe("?x=1");
      expect(window.location.hash).toBe("#sec");
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
      expect(window.location.pathname).toBe("/cart");
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
