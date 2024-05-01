import { computed, shallowRef } from "vue";
import { useGetWhiteLabelingSettings } from "@/core/api/graphql/whiteLabeling/queries";
import { useThemeContext } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { useUser } from "./useUser";
import type { WhiteLabelingSettingsType } from "@/core/api/graphql/types";

const whiteLabelingSettings = shallowRef<WhiteLabelingSettingsType>();

const { modulesSettings } = useThemeContext();
const { user } = useUser();

const MODULE_KEYS = {
  ID: "VirtoCommerce.WhiteLabeling",
  ENABLE_STATE: "WhiteLabeling.WhiteLabelingEnabled",
};

const moduleSettings = computed(() => modulesSettings.value?.find((module) => module.moduleId === MODULE_KEYS.ID));
const moduleEnabled = computed(
  () => moduleSettings.value?.settings?.find((item) => item.name === MODULE_KEYS.ENABLE_STATE)?.value,
);

export function useWhiteLabeling() {
  async function fetchWhiteLabelingSettings(): Promise<void> {
    if (moduleEnabled.value && user.value?.contact?.organizationId) {
      const { result, load } = useGetWhiteLabelingSettings(user.value.contact.organizationId);

      try {
        await load();

        if (result.value?.whiteLabelingSettings) {
          whiteLabelingSettings.value = result.value.whiteLabelingSettings;
        }
      } catch (e) {
        Logger.error(`${useWhiteLabeling.name}.${fetchWhiteLabelingSettings.name}`, e);
        throw e;
      }
    }
  }

  return {
    whiteLabelingSettings: computed(() => whiteLabelingSettings.value),
    fetchWhiteLabelingSettings,
  };
}
