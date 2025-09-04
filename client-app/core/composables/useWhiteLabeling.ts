import { createGlobalState, useEventBus } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import settingsData from "@/config/settings_data.json";
import { getGetWhiteLabelingSettings, getFooterLinks } from "@/core/api/graphql/whiteLabeling/queries";
import { IS_DEVELOPMENT } from "@/core/constants";
import { WHITE_LABELING_FETCHED_SETTINGS_EVENT } from "@/core/constants/modules-events";
import { Logger, convertToExtendedMenuLink, extractHostname } from "@/core/utilities";
import type { WhiteLabelingSettingsType, MenuLinkType } from "@/core/api/graphql/types";

const whiteLabelingSettings = shallowRef<WhiteLabelingSettingsType>();
const fetchedSettings = shallowRef<WhiteLabelingSettingsType>();
const footerLinks = ref<MenuLinkType[]>();

const MODULE_KEYS = {
  ID: "VirtoCommerce.WhiteLabeling",
  ENABLE_STATE: "WhiteLabeling.WhiteLabelingEnabled",
};

const { emit } = useEventBus(WHITE_LABELING_FETCHED_SETTINGS_EVENT);

const currentDomain = IS_DEVELOPMENT ? extractHostname(import.meta.env.APP_BACKEND_URL as string) : window.location.hostname;

/**
 * Independent composable.
 * Does not rely on global context.
 */
function _useWhiteLabeling() {
  /**
   * Applies previously fetched white labeling settings.
   *
   * @remarks
   * - Use only after {@link fetchWhiteLabelingSettings}.
   */
  async function fetchWhiteLabelingSettings(): Promise<void> {
    try {
      fetchedSettings.value = await getGetWhiteLabelingSettings(currentDomain);
    } catch (e) {
      Logger.error(`${_useWhiteLabeling.name}.${fetchWhiteLabelingSettings.name}`, e);
      throw e;
    }
  }

  /**
   * Fetches and stores white labeling settings.
   *
   * @remarks
   * - Not for standalone use; must be followed by {@link applyWhiteLabelingSettings}.
   * - Purpose: load settings in parallel during app initialization.
   */
  function applyWhiteLabelingSettings() {
    if(fetchedSettings.value) {
      whiteLabelingSettings.value = fetchedSettings.value;
      fetchedSettings.value = undefined;

      emit(whiteLabelingSettings.value);
    }
  }

  /**
   * Fetches and applies footer links.
   *
   * @param cultureName - Locale in 4-character format (e.g., "en-US").
   *
   * @remarks
   * - Asynchronous method.
   * - Locale-dependent.
   */
  async function fetchAndApplyFooterLinks(cultureName: string) {
    try {
      footerLinks.value = (await getFooterLinks(currentDomain, cultureName))?.footerLinks;
    } catch (e) {
      Logger.error(`${_useWhiteLabeling.name}.${fetchAndApplyFooterLinks.name}`, e);
      throw e;
    }
  }

  return {
    MODULE_KEYS,
    fetchWhiteLabelingSettings,
    applyWhiteLabelingSettings,
    fetchAndApplyFooterLinks,

    logoUrl: computed(() => whiteLabelingSettings.value?.logoUrl ?? settingsData.settings.logo_image),
    secondaryLogoUrl: computed(
      () => whiteLabelingSettings.value?.secondaryLogoUrl ?? settingsData.settings.logo_inverted_image,
    ),
    footerLinks: computed(() =>
      footerLinks.value?.map((item) => convertToExtendedMenuLink(item)),
    ),
    favIcons: computed(() => whiteLabelingSettings.value?.favicons),
    themePresetName: computed(() => whiteLabelingSettings.value?.themePresetName),
    whiteLabelingLogoUrl: computed(() => whiteLabelingSettings.value?.logoUrl),
    isOrganizationLogoUploaded: computed(() => whiteLabelingSettings.value?.isOrganizationLogoUploaded),
  };
}

export const useWhiteLabeling = createGlobalState(_useWhiteLabeling);
