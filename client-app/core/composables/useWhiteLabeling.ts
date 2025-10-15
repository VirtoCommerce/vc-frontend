import { createGlobalState, useEventBus } from "@vueuse/core";
import { computed, shallowRef } from "vue";
import { getGetWhiteLabelingSettings } from "@/core/api/graphql/whiteLabeling/queries";
import { WHITE_LABELING_FETCHED_SETTINGS_EVENT } from "@/core/constants/modules-events";
import { Logger, convertToExtendedMenuLink } from "@/core/utilities";
import { useThemeContext } from "./useThemeContext";
import type { IThemeConfigPreset } from "../types";
import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";

const whiteLabelingSettings = shallowRef<WhiteLabelingSettingsType>();

const MODULE_KEYS = {
  ID: "VirtoCommerce.WhiteLabeling",
  ENABLE_STATE: "WhiteLabeling.WhiteLabelingEnabled",
};

const { emit } = useEventBus(WHITE_LABELING_FETCHED_SETTINGS_EVENT);

const styleElement = document.createElement("style");
let styleElementAdded = false;

function addPresetStylesToDocument(preset?: IThemeConfigPreset) {
  if (!preset) {
    return;
  }

  let styleText = "";

  styleText += ":root {";

  Object.entries(preset).forEach(([key, value]) => {
    styleText += `--${key.replace(/_/g, "-")}: ${value};`;
  });

  styleText += "}";

  if (!styleElementAdded || styleElement.innerText !== styleText) {
    styleElement.innerText = styleText;
    document.head.prepend(styleElement);
    styleElementAdded = true;
  }
}

function _useWhiteLabeling() {
  const { themeContext, addPresetToThemeContext, modulesSettings } = useThemeContext();

  const moduleSettings = computed(() => modulesSettings.value?.find((module) => module.moduleId === MODULE_KEYS.ID));
  const moduleEnabled = computed(
    () => moduleSettings.value?.settings?.find((item) => item.name === MODULE_KEYS.ENABLE_STATE)?.value,
  );

  async function fetchWhiteLabelingSettings(): Promise<void> {
    if (moduleEnabled.value) {
      try {
        addPresetToThemeContext(themeContext.value?.defaultPresetName);
        addPresetStylesToDocument(themeContext.value?.preset);

        whiteLabelingSettings.value = await getGetWhiteLabelingSettings();

        if (whiteLabelingSettings.value?.themePresetName) {
          addPresetToThemeContext(whiteLabelingSettings.value?.themePresetName);
          addPresetStylesToDocument(themeContext.value?.preset);
        }

        emit(whiteLabelingSettings.value);
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
    whiteLabelingLogoUrl: computed(() => whiteLabelingSettings.value?.logoUrl),
    isOrganizationLogoUploaded: computed(() => whiteLabelingSettings.value?.isOrganizationLogoUploaded),
  };
}

export const useWhiteLabeling = createGlobalState(_useWhiteLabeling);
