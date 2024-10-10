import { createGlobalState } from "@vueuse/core";
import { readonly, ref } from "vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { DefineComponent } from "vue";

export type ElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: DefineComponent<{ item: ExtendedMenuLinkType }, Record<string, any>, any>;
};

function _useCustomMobileMenuLinkComponents() {
  const customLinkComponents = ref<{ [key: ElementType["id"]]: ElementType["component"] }>({});

  function registerCustomLinkComponent(element: ElementType) {
    if (!customLinkComponents.value[element.id]) {
      customLinkComponents.value[element.id] = element.component;
    }
  }

  return {
    customLinkComponents: readonly(customLinkComponents),
    registerCustomLinkComponent,
  };
}

export const useCustomMobileMenuLinkComponents = createGlobalState(_useCustomMobileMenuLinkComponents);
