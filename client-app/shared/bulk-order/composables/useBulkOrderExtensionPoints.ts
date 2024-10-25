import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import type { DefineComponent } from "vue";

type TabType = {
  id: string;
  icon: string;
  label: string;
  hidden?: boolean;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  element: DefineComponent<Record<string, any>, Record<string, any>, any>;
};

function _useBulkOrderExtensionPoints() {
  const additionalTabs = ref<TabType[]>([]);

  function registerAdditionalTab(tab: TabType) {
    if (!additionalTabs.value.some((el) => el.id === tab.id)) {
      additionalTabs.value.push(tab);
    }
  }

  return {
    additionalTabs,
    registerAdditionalTab,
  };
}

export const useBulkOrderExtensionPoints = createGlobalState(_useBulkOrderExtensionPoints);
