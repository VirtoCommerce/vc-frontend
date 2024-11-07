import { createGlobalState } from "@vueuse/core";
import { readonly, ref } from "vue";
import type { DefineComponent } from "vue";

export type ElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: DefineComponent<Record<string, any>, Record<string, any>, any>;
};

function _useCustomMobileHeaderComponents() {
  const customComponents = ref<{ [key: ElementType["id"]]: ElementType["component"] }>({

  });

  function registerCustomComponent(element: ElementType) {
    if (!customComponents.value[element.id]) {
      customComponents.value[element.id] = element.component;
    }
  }

  return {
    customComponents: readonly(customComponents),
    registerCustomComponent,
  };
}

export const useCustomMobileHeaderComponents = createGlobalState(_useCustomMobileHeaderComponents);
