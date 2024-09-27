import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, readonly, ref } from "vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { DefineComponent } from "vue";

export type ElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: DefineComponent<{ item: ExtendedMenuLinkType }, Record<string, any>, any>;
};

function _useCustomHeaderLinkComponents() {
  const customLinkComponents = ref<{ [key: ElementType["id"]]: ElementType["component"] }>({
    compare: defineAsyncComponent(
      () => import("@/shared/layout/components/header/_internal/link-components/link-compare.vue"),
    ),
    cart: defineAsyncComponent(
      () => import("@/shared/layout/components/header/_internal/link-components/link-cart.vue"),
    ),
  });

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

export const useCustomHeaderLinkComponents = createGlobalState(_useCustomHeaderLinkComponents);
