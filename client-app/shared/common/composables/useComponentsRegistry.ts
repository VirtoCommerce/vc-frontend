import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import type { ComponentRegistryType } from "@/shared/common/types/components-registry";

const initialComponentRegistry: ComponentRegistryType = {
  header: {
    compare: defineAsyncComponent(
      () => import("@/shared/layout/components/header/_internal/link-components/link-compare.vue"),
    ),
    cart: defineAsyncComponent(
      () => import("@/shared/layout/components/header/_internal/link-components/link-cart.vue"),
    ),
  },
  mobileMenu: {
    cart: defineAsyncComponent(
      () => import("@/shared/layout/components/header/_internal/mobile-menu/link-components/link-cart.vue"),
    ),
    compare: defineAsyncComponent(
      () => import("@/shared/layout/components/header/_internal/mobile-menu/link-components/link-compare.vue"),
    ),
  },
  account: {
    orders: defineAsyncComponent(
      () => import("@/shared/account/components/account-navigation-link-components/link-orders.vue"),
    ),
    lists: defineAsyncComponent(
      () => import("@/shared/account/components/account-navigation-link-components/link-lists.vue"),
    ),
  },
  mobileHeader: {},
};

function _useComponentsRegistry() {
  const componentRegistry = shallowRef<ComponentRegistryType>(initialComponentRegistry);

  function registerComponent<T extends keyof ComponentRegistryType>(
    type: T,
    id: string,
    component: ComponentRegistryType[T][string],
  ) {
    if (!componentRegistry.value[type][id]) {
      componentRegistry.value[type][id] = component;
    }
  }

  function unregisterComponent<T extends keyof ComponentRegistryType>(type: T, id: string) {
    delete componentRegistry.value[type][id];
  }

  function getComponents(type: keyof ComponentRegistryType) {
    return shallowReadonly(componentRegistry.value[type]);
  }

  function isComponentRegistered<T extends keyof ComponentRegistryType>(type: T, id: string) {
    return componentRegistry.value[type][id] !== undefined;
  }

  if (IS_DEVELOPMENT) {
    window.vcComponentsRegistry = {
      components: componentRegistry.value,
      registerComponent,
      getComponents,
      unregisterComponent,
      isComponentRegistered,
    };
  }

  return {
    components: componentRegistry.value,

    headerLinkComponents: shallowReadonly(componentRegistry.value.header),
    mobileLinkComponents: shallowReadonly(componentRegistry.value.mobileMenu),
    accountLinkComponents: shallowReadonly(componentRegistry.value.account),
    mobileHeaderComponents: shallowReadonly(componentRegistry.value.mobileHeader),

    getComponents,
    registerComponent,
    unregisterComponent,
    isComponentRegistered,
  };
}

export const useComponentsRegistry = createGlobalState(_useComponentsRegistry);
