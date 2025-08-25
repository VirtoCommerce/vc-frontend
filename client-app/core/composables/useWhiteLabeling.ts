import { createGlobalState, useEventBus } from "@vueuse/core";
import { computed, shallowRef } from "vue";
import settingsData from "@/config/settings_data.json";
import { getGetWhiteLabelingSettings } from "@/core/api/graphql/whiteLabeling/queries";
import { IS_DEVELOPMENT } from "@/core/constants";
import { WHITE_LABELING_FETCHED_SETTINGS_EVENT } from "@/core/constants/modules-events";
import { Logger, convertToExtendedMenuLink, extractHostname } from "@/core/utilities";
import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";

const whiteLabelingSettings = shallowRef<WhiteLabelingSettingsType>();
const fetchedSettings = shallowRef<WhiteLabelingSettingsType>();

const MODULE_KEYS = {
  ID: "VirtoCommerce.WhiteLabeling",
  ENABLE_STATE: "WhiteLabeling.WhiteLabelingEnabled",
};

const { emit } = useEventBus(WHITE_LABELING_FETCHED_SETTINGS_EVENT);

function _useWhiteLabeling() {
  async function fetchWhiteLabelingSettings(): Promise<void> {
    try {
      fetchedSettings.value = await getGetWhiteLabelingSettings(IS_DEVELOPMENT ? extractHostname(import.meta.env.APP_BACKEND_URL as string) : window.location.hostname);
    } catch (e) {
      Logger.error(`${_useWhiteLabeling.name}.${fetchWhiteLabelingSettings.name}`, e);
      throw e;
    }
  }

  function applyWhiteLabelingSettings() {
    if(fetchedSettings.value) {
      whiteLabelingSettings.value = fetchedSettings.value;
      fetchedSettings.value = undefined;

      emit(whiteLabelingSettings.value);
    }
  }

  return {
    MODULE_KEYS,
    fetchWhiteLabelingSettings,
    applyWhiteLabelingSettings,

    logoUrl: computed(() => whiteLabelingSettings.value?.logoUrl ?? settingsData.settings.logo_image),
    secondaryLogoUrl: computed(
      () => whiteLabelingSettings.value?.secondaryLogoUrl ?? settingsData.settings.logo_inverted_image,
    ),
    footerLinks: computed(() =>
      whiteLabelingSettings.value?.footerLinks?.map((item) => convertToExtendedMenuLink(item)),
    ),
    favIcons: computed(() => whiteLabelingSettings.value?.favicons),
    themePresetName: computed(() => whiteLabelingSettings.value?.themePresetName),
    whiteLabelingLogoUrl: computed(() => whiteLabelingSettings.value?.logoUrl),
    isOrganizationLogoUploaded: computed(() => whiteLabelingSettings.value?.isOrganizationLogoUploaded),
  };
}

export const useWhiteLabeling = createGlobalState(_useWhiteLabeling);
