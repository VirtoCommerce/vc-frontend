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
  };
}

export const useWhiteLabeling = createGlobalState(_useWhiteLabeling);
