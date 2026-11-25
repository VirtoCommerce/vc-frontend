import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { ROUTES } from "@/router/routes/constants";
import { usePreferencesMenu } from "./usePreferencesMenu";

const state = vi.hoisted(() => ({
  currencies: { value: [] as { code: string }[] },
  languages: { value: [] as { cultureName: string }[] },
  isDarkModeAvailable: { value: false },
  catalogBasePath: { value: "" },
}));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({ supportedCurrencies: state.currencies }),
}));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ supportedLanguages: state.languages }),
}));

vi.mock("@/core/composables/useDarkMode", () => ({
  useDarkMode: () => ({ isDarkModeAvailable: state.isDarkModeAvailable }),
}));

vi.mock("@/shared/catalog/composables/useCatalogBasePath", () => ({
  useCatalogBasePath: () => state.catalogBasePath,
}));

beforeEach(() => {
  state.currencies = ref([{ code: "USD" }, { code: "EUR" }]);
  state.languages = ref([{ cultureName: "en-US" }, { cultureName: "de-DE" }]);
  state.isDarkModeAvailable = ref(true);
  state.catalogBasePath = ref("");
});

describe("usePreferencesMenu", () => {
  it("offers every group when each has a choice", () => {
    const { isCurrencyShown, isAppearanceShown, isLanguageShown, hasPreferences } = usePreferencesMenu();

    expect([isCurrencyShown.value, isAppearanceShown.value, isLanguageShown.value, hasPreferences.value]).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });

  it("offers no currency in a single-currency store", () => {
    state.currencies.value = [{ code: "USD" }];

    expect(usePreferencesMenu().isCurrencyShown.value).toBe(false);
  });

  it("offers no currency on the loyalty catalog routes", () => {
    state.catalogBasePath.value = ROUTES.LOYALTY_CATALOG.PATH;

    expect(usePreferencesMenu().isCurrencyShown.value).toBe(false);
  });

  it("offers no language in a single-language store", () => {
    state.languages.value = [{ cultureName: "en-US" }];

    expect(usePreferencesMenu().isLanguageShown.value).toBe(false);
  });

  it("offers no appearance without a dark preset", () => {
    state.isDarkModeAvailable.value = false;

    expect(usePreferencesMenu().isAppearanceShown.value).toBe(false);
  });

  it("has nothing to offer when no group has a choice", () => {
    state.currencies.value = [{ code: "USD" }];
    state.languages.value = [{ cultureName: "en-US" }];
    state.isDarkModeAvailable.value = false;

    expect(usePreferencesMenu().hasPreferences.value).toBe(false);
  });

  it.each([
    ["currency", () => (state.currencies.value = [{ code: "USD" }, { code: "EUR" }])],
    ["appearance", () => (state.isDarkModeAvailable.value = true)],
    ["language", () => (state.languages.value = [{ cultureName: "en-US" }, { cultureName: "de-DE" }])],
  ])("has something to offer with only the %s group", (_, offer) => {
    state.currencies.value = [{ code: "USD" }];
    state.languages.value = [{ cultureName: "en-US" }];
    state.isDarkModeAvailable.value = false;
    offer();

    expect(usePreferencesMenu().hasPreferences.value).toBe(true);
  });
});
