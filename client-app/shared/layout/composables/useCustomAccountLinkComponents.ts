import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, readonly, ref } from "vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { DefineComponent } from "vue";

export type ElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: DefineComponent<{ item: ExtendedMenuLinkType }, Record<string, any>, any>;
};

function _useCustomAccountLinkComponents() {
  const customAccountLinkComponents = ref<{ [key: ElementType["id"]]: ElementType["component"] }>({
    orders: defineAsyncComponent(
      () => import("@/shared/account/components/account-navigation-link-components/link-orders.vue"),
    ),
    lists: defineAsyncComponent(
      () => import("@/shared/account/components/account-navigation-link-components/link-lists.vue"),
    ),
  });

  function registerCustomLinkComponent(element: ElementType) {
    if (!customAccountLinkComponents.value[element.id]) {
      customAccountLinkComponents.value[element.id] = element.component;
    }
  }

  return {
    customLinkComponents: readonly(customAccountLinkComponents),
    registerCustomLinkComponent,
  };
}

export const useCustomAccountLinkComponents = createGlobalState(_useCustomAccountLinkComponents);
