import { setup } from "@storybook/vue3-vite";
import { presets } from "../client-app/assets/presets";
import { useThemeContext } from "../client-app/core/composables";
import { setGlobals } from "../client-app/core/globals";
import { createI18n } from "../client-app/i18n";
import { uiKit } from "../client-app/ui-kit";
import UI_KIT_DEFAULT_MESSAGE from "../client-app/ui-kit/locales/en.json";
import { a11yConfig } from "./a11y-config";
import { createStorybookRouter } from "./router";
import type { StoreResponseType } from "../client-app/core/api/graphql/types";
import type { IThemeConfigPreset } from "../client-app/core/types";
import type { I18n } from "../client-app/i18n";
import type { Preview } from "@storybook/vue3-vite";

import "../storybook-styles/swiper.scss";
import "../storybook-styles/utilities.scss";

const DEFAULT_LOCALE = "en";
const DEFAULT_CURRENCY = "USD";

const i18n: I18n = createI18n(DEFAULT_LOCALE, DEFAULT_CURRENCY);
const router = createStorybookRouter();

// Remove this after refactoring the VcImage component
const { setThemeContext } = useThemeContext();
setThemeContext({
  storeId: "storybook",
  storeName: "Storybook",
  catalogId: "storybook",
  storeUrl: "https://storybook.example.com",
  defaultLanguage: {
    twoLetterLanguageName: "en",
    threeLetterLanguageName: "eng",
    cultureName: "en-US",
    nativeName: "English",
    twoLetterRegionName: "US",
    threeLetterRegionName: "USA",
    isInvariant: false,
  },
  defaultCurrency: {
    code: "USD",
    symbol: "$",
    cultureName: "en-US",
    englishName: "US Dollar",
    exchangeRate: 1,
    isInvariant: false,
  },
  availableLanguages: [],
  availableCurrencies: [],
  graphQLSettings: { keepAliveInterval: 30 },
  settings: {
    image_thumbnails_enabled: true,
    image_thumbnails_suffixes: { sm: "sm", md: "md", lg: "lg" },
    anonymousUsersAllowed: true,
    modules: [],
    authenticationTypes: [],
    createAnonymousOrderEnabled: true,
    defaultSelectedForCheckout: true,
    emailVerificationEnabled: false,
    emailVerificationRequired: false,
    environmentName: "storybook",
    passwordRequirements: {
      requireLowercase: false,
      requireUppercase: false,
      requireDigit: false,
      requiredLength: 6,
      requiredUniqueChars: 0,
      requireNonAlphanumeric: false,
    },
    seoLinkType: "short",
    subscriptionEnabled: false,
    taxCalculationEnabled: false,
    isSpa: true,
    quotesEnabled: false,
  },
} as StoreResponseType);

// List of available theme presets
const PRESETS = Object.keys(presets);
type PresetNameType = keyof typeof presets;

let currentStyleElement: HTMLStyleElement | null = null;
let currentPresetName: PresetNameType | null = null;
let loadingPreset: PresetNameType | null = null;
let i18nConfigured = false;

// Enable for debugging: track DOM changes (only in dev mode)
const ENABLE_DOM_MONITORING = import.meta.env.MODE === "development";
if (ENABLE_DOM_MONITORING && typeof window !== "undefined") {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.target === document.head) {
        // eslint-disable-next-line no-console
        console.log("DOM changed in <head>:", {
          addedNodes: mutation.addedNodes.length,
          removedNodes: mutation.removedNodes.length,
          target: mutation.target,
        });
      }
    });
  });

  observer.observe(document.head, {
    childList: true,
    subtree: false,
  });

  // eslint-disable-next-line no-console
  console.log("MutationObserver activated for monitoring <head>");
}

async function configureThemeSettings(presetName: PresetNameType = "default") {
  if (currentPresetName === presetName && currentStyleElement) {
    return;
  }
  if (loadingPreset === presetName) {
    return;
  }

  loadingPreset = presetName;

  try {
    const module = (await import(`@/assets/presets/${presetName}.json`)) as {
      default: IThemeConfigPreset;
    };
    const preset = module.default;

    if (preset) {
      if (currentStyleElement && currentStyleElement.parentNode) {
        currentStyleElement.parentNode.removeChild(currentStyleElement);
      }

      currentStyleElement = document.createElement("style");
      currentStyleElement.innerText = ":root {";
      Object.entries(preset).forEach(([key, value]) => {
        currentStyleElement!.innerText += `--${key.replace(/_/g, "-")}: ${value};`;
      });
      currentStyleElement.innerText += "}";
      document.head.prepend(currentStyleElement);
      currentPresetName = presetName;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load preset "${presetName}":`, error);
  } finally {
    if (loadingPreset === presetName) {
      loadingPreset = null;
    }
  }
}

function configureI18N() {
  if (i18nConfigured) {
    return;
  }

  i18n.global.setLocaleMessage(DEFAULT_LOCALE, UI_KIT_DEFAULT_MESSAGE);
  i18nConfigured = true;
}

setGlobals({ i18n });

setup((app) => {
  if (!app || typeof app.use !== "function") {
    return;
  }

  try {
    app.use(router);
    app.use(i18n);
    app.use(uiKit);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Storybook Vue setup error:", error);
  }

  configureI18N();
});

const preview: Preview = {
  globalTypes: {
    themePreset: {
      description: "Select theme preset",
      defaultValue: "default",
      toolbar: {
        title: "Theme preset",
        icon: "paintbrush",
        items: PRESETS.map((preset) => ({
          value: preset,
          title: preset.charAt(0).toUpperCase() + preset.slice(1).replace(/-/g, " "),
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    themePreset: "default",
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    options: {
      storySort: {
        order: ["*", "Components", ["Atoms", "Molecules", "Organisms", "Templates", "Pages"]],
      },
    },
    a11y: a11yConfig,
  },
  decorators: [
    (story, context) => {
      const presetName = context.globals.themePreset || "default";

      if (presetName !== currentPresetName && presetName !== loadingPreset) {
        configureThemeSettings(presetName).catch(() => {
          // eslint-disable-next-line no-console
          console.error("Storybook theme setup error");
        });
      }

      return story();
    },
  ],
  tags: ["autodocs"],
};

export default preview;
