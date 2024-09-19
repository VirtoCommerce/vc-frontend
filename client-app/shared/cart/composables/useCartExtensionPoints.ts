import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import type { DefineComponent } from "vue";

type ElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  element: DefineComponent<Record<string, any>, Record<string, any>, any>;
};

function _useCartExtensionPoints() {
  const sidebarWidgets = ref<ElementType[]>([]);

  function registerSidebarWidget(element: ElementType) {
    if (!sidebarWidgets.value.find((el) => el.id === element.id)) {
      sidebarWidgets.value.push(element);
    }
  }

  function unregisterSidebarWidget(id: string) {
    sidebarWidgets.value = sidebarWidgets.value.filter((el) => el.id === id);
  }

  return {
    sidebarWidgets,
    registerSidebarWidget,
    unregisterSidebarWidget,
  };
}

export const useCartExtensionPoints = createGlobalState(_useCartExtensionPoints);
