import { createGlobalState, useEventBus } from "@vueuse/core";
import { computed, shallowRef } from "vue";
import { getGetWhiteLabelingSettings } from "@/core/api/graphql/whiteLabeling/queries";
import { WHITE_LABELING_FETCHED_SETTINGS_EVENT } from "@/core/constants/modules-events";
import { useThemeSnapshot } from "@/core/theme-snapshot/useThemeSnapshot";
import { Logger, convertToExtendedMenuLink } from "@/core/utilities";
import { useThemeContext } from "./useThemeContext";
import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";

const whiteLabelingSettings = shallowRef<WhiteLabelingSettingsType>();
const { modulesSettings, themeContext } = useThemeContext();
const { theme } = useThemeSnapshot();

const MODULE_KEYS = {
  ID: "VirtoCommerce.WhiteLabeling",
  ENABLE_STATE: "WhiteLabeling.WhiteLabelingEnabled",
};

const moduleSettings = computed(() => modulesSettings.value?.find((module) => module.moduleId === MODULE_KEYS.ID));
const moduleEnabled = computed(
  () => moduleSettings.value?.settings?.find((item) => item.name === MODULE_KEYS.ENABLE_STATE)?.value,
);

const { emit } = useEventBus(WHITE_LABELING_FETCHED_SETTINGS_EVENT);

function setWhiteLabelingSettings(payload?: WhiteLabelingSettingsType) {
  if (moduleEnabled.value) {
    whiteLabelingSettings.value = payload;
    emit(whiteLabelingSettings.value);
  }
}

/**
 * White-labeling (the organization's, then the store's, merged in pageContext) wins over the Page Builder theme field
 * by field; the theme fills only what white-labeling left empty, and the storefront's own settings come last.
 */
function pickBrandField(
  whiteLabelingValue: string | null | undefined,
  themeValue: string | undefined,
  fallback: string | undefined,
): string | undefined {
  if (whiteLabelingValue) {
    return whiteLabelingValue;
  }

  if (themeValue) {
    return themeValue;
  }

  return whiteLabelingValue ?? fallback;
}

/**
 * The logo for dark backgrounds that belongs with `logoUrl`: from the same source (white-labeling, the Page Builder
 * theme, the storefront's settings), so a light logo of one source never gets the dark logo of another.
 */
function pickDarkLogo(): string | undefined {
  const settings = whiteLabelingSettings.value;

  if (settings?.logoUrl) {
    // The secondary logo merged with an organization's logo may be the store's: nothing tells whose it is.
    return settings.isOrganizationLogoUploaded ? undefined : settings.secondaryLogoUrl || undefined;
  }

  if (theme.value?.brand.logoUrl) {
    return theme.value.brand.secondaryLogoUrl || undefined;
  }

  return themeContext.value?.settings?.logo_inverted_image;
}

function _useWhiteLabeling() {
  async function fetchWhiteLabelingSettings(): Promise<void> {
    if (!moduleEnabled.value) {
      return;
    }

    try {
      const settingsData = await getGetWhiteLabelingSettings();
      setWhiteLabelingSettings(settingsData);
    } catch (e) {
      Logger.error(`${_useWhiteLabeling.name}.${fetchWhiteLabelingSettings.name}`, e);
      throw e;
    }
  }

  return {
    logoUrl: computed(() =>
      pickBrandField(
        whiteLabelingSettings.value?.logoUrl,
        theme.value?.brand.logoUrl,
        themeContext.value?.settings?.logo_image,
      ),
    ),
    secondaryLogoUrl: computed(() =>
      pickBrandField(
        whiteLabelingSettings.value?.secondaryLogoUrl,
        theme.value?.brand.secondaryLogoUrl,
        themeContext.value?.settings?.logo_inverted_image,
      ),
    ),
    darkLogoUrl: computed(pickDarkLogo),
    footerLinks: computed(() =>
      whiteLabelingSettings.value?.footerLinks?.map((item) => convertToExtendedMenuLink(item)),
    ),
    mainMenuLinks: computed(() =>
      whiteLabelingSettings.value?.mainMenuLinks?.map((item) => convertToExtendedMenuLink(item)),
    ),
    favIcons: computed(() => {
      const favicons = whiteLabelingSettings.value?.favicons;
      const themeFavicon = theme.value?.brand.faviconUrl;

      return !favicons?.length && themeFavicon ? [{ rel: "icon", href: themeFavicon }] : favicons;
    }),
    themePresetName: computed(() => whiteLabelingSettings.value?.themePresetName),
    fetchWhiteLabelingSettings,
    setWhiteLabelingSettings,
    whiteLabelingLogoUrl: computed(() => whiteLabelingSettings.value?.logoUrl),
    isOrganizationLogoUploaded: computed(() => whiteLabelingSettings.value?.isOrganizationLogoUploaded),
    /** The Page Builder theme's fields white-labeling sets for this visitor, which the theme therefore does not change. */
    themeFieldsSetByWhiteLabeling: computed(() => {
      const settings = whiteLabelingSettings.value;
      const fields: [string, unknown][] = [
        ["brand.logoUrl", settings?.logoUrl],
        // The header and the footer take the dark logo from the light logo's source.
        ["brand.secondaryLogoUrl", settings?.secondaryLogoUrl || settings?.logoUrl],
        ["brand.faviconUrl", settings?.favicons?.length],
        ["palette", settings?.themePresetName],
        // The main menu replaces the header's category menu (`catalog_menu`) only; the icons menu stays the theme's.
        ["menus.header", settings?.mainMenuLinks?.length],
        // The footer links replace the footer's columns.
        ["menus.footer", settings?.footerLinks?.length],
      ];
      return fields.filter(([, value]) => !!value).map(([field]) => field);
    }),
  };
}

export const useWhiteLabeling = createGlobalState(_useWhiteLabeling);
