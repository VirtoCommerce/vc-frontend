import { createGlobalState } from "@vueuse/core";
import { shallowRef } from "vue";
import type { DefineComponent } from "vue";

type ElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  element: DefineComponent<Record<string, any>, Record<string, any>, any>;
};

function _useCartExtensionPoints() {
  const sidebarWidgets = shallowRef<ElementType[]>([]);

  function registerSidebarWidget(element: ElementType) {
    if (!sidebarWidgets.value.some((el) => el.id === element.id)) {
      sidebarWidgets.value.push(element);
    }
  }

  return {
    sidebarWidgets,
    registerSidebarWidget,
  };
}

export const useCartExtensionPoints = createGlobalState(_useCartExtensionPoints);
