import { createGlobalState } from "@vueuse/core";
import { computed, shallowRef } from "vue";
import { getGetWhiteLabelingSettings } from "@/core/api/graphql/whiteLabeling/queries";
import { Logger, convertToExtendedMenuLink } from "@/core/utilities";
import { useThemeContext } from "./useThemeContext";
import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";

const whiteLabelingSettings = shallowRef<WhiteLabelingSettingsType>();
const { modulesSettings, themeContext } = useThemeContext();

const MODULE_KEYS = {
  ID: "VirtoCommerce.WhiteLabeling",
  ENABLE_STATE: "WhiteLabeling.WhiteLabelingEnabled",
};

const moduleSettings = computed(() => modulesSettings.value?.find((module) => module.moduleId === MODULE_KEYS.ID));
const moduleEnabled = computed(
  () => moduleSettings.value?.settings?.find((item) => item.name === MODULE_KEYS.ENABLE_STATE)?.value,
);

function _useWhiteLabeling() {
  async function fetchWhiteLabelingSettings(): Promise<void> {
    if (moduleEnabled.value) {
      try {
        whiteLabelingSettings.value = await getGetWhiteLabelingSettings();
      } catch (e) {
        Logger.error(`${_useWhiteLabeling.name}.${fetchWhiteLabelingSettings.name}`, e);
        throw e;
      }
    }
  }

  return {
    logoUrl: computed(() => whiteLabelingSettings.value?.logoUrl ?? themeContext.value?.settings?.logo_image),
    secondaryLogoUrl: computed(
      () => whiteLabelingSettings.value?.secondaryLogoUrl ?? themeContext.value?.settings?.logo_inverted_image,
    ),
    footerLinks: computed(() =>
      whiteLabelingSettings.value?.footerLinks?.map((item) => convertToExtendedMenuLink(item)),
    ),
    favIcons: computed(() => whiteLabelingSettings.value?.favicons),
    themePresetName: computed(() => whiteLabelingSettings.value?.themePresetName),
    fetchWhiteLabelingSettings,
  };
}

export const useWhiteLabeling = createGlobalState(_useWhiteLabeling);
