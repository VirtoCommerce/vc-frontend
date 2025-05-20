import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type { ComponentRegistryType, ConditionParamsType } from "@/shared/common/types/components-registry";

const initialComponentRegistry: ComponentRegistryType = {
  headerMenu: {
    compare: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/link-components/link-compare.vue"),
      ),
    },
    cart: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/link-components/link-cart.vue"),
      ),
    },
  },
  mobileMenu: {
    cart: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/mobile-menu/link-components/link-cart.vue"),
      ),
    },
    compare: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/mobile-menu/link-components/link-compare.vue"),
      ),
    },
  },
  accountMenu: {
    orders: {
      component: defineAsyncComponent(
        () => import("@/shared/account/components/account-navigation-link-components/link-orders.vue"),
      ),
    },
    lists: {
      component: defineAsyncComponent(
        () => import("@/shared/account/components/account-navigation-link-components/link-lists.vue"),
      ),
    },
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
    } else {
      Logger.warn(`useComponentsRegistry: Component "${type}/${id}" already registered`);
    }
  }

  function unregisterComponent<T extends keyof ComponentRegistryType>(type: T, id: string) {
    delete componentRegistry.value[type][id];
  }

  function getRegistryItem(type: keyof ComponentRegistryType, id: string) {
    return componentRegistry.value[type][id];
  }

  function getRegistryItems(type: keyof ComponentRegistryType) {
    return shallowReadonly(componentRegistry.value[type]);
  }

  function getComponent(type: keyof ComponentRegistryType, id: string) {
    return componentRegistry.value[type][id]?.component;
  }

  function isComponentRegistered<T extends keyof ComponentRegistryType>(type: T, id: string) {
    return componentRegistry.value[type][id] !== undefined;
  }

  function shouldRenderComponent(
    type: keyof ComponentRegistryType,
    id: string,
    params?: ConditionParamsType<ComponentRegistryType[keyof ComponentRegistryType][string]>,
  ) {
    if (typeof componentRegistry.value[type][id]?.condition === "function") {
      try {
        return componentRegistry.value[type][id]?.condition?.(...(params || []));
      } catch (error) {
        Logger.error(`useComponentsRegistry: Error in condition for component "${type}/${id}"`, error);
        return false;
      }
    }
    return true;
  }

  function getComponentProps(type: keyof ComponentRegistryType, id: string) {
    return componentRegistry.value[type][id]?.props;
  }

  if (IS_DEVELOPMENT) {
    window.vcComponentsRegistry = {
      components: componentRegistry.value,

      registerComponent,
      unregisterComponent,

      getComponent,
      getRegistryItem,
      getRegistryItems,

      getComponentProps,

      isComponentRegistered,
      shouldRenderComponent,
    };
  }

  return {
    components: componentRegistry.value,

    registerComponent,
    unregisterComponent,

    getComponent,
    getRegistryItem,
    getRegistryItems,

    getComponentProps,

    isComponentRegistered,
    shouldRenderComponent,
  };
}

export const useComponentsRegistry = createGlobalState(_useComponentsRegistry);
