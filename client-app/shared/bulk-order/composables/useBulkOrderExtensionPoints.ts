import { createGlobalState } from "@vueuse/core";
import { shallowRef } from "vue";
import type { DefineComponent, MaybeRefOrGetter } from "vue";

export interface ITab {
  id: string;
  icon: string;
  label: MaybeRefOrGetter<string>;
  hidden?: MaybeRefOrGetter<boolean>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  element: DefineComponent<Record<string, any>, Record<string, any>, any>;
}

function _useBulkOrderExtensionPoints() {
  const additionalTabs = shallowRef<ITab[]>([]);

  function registerAdditionalTab(tab: ITab) {
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
