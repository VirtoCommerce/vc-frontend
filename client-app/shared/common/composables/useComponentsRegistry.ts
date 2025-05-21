import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type {
  ComponentRegistryStateType,
  ComponentsRegistryType,
  ComponentTypeByRegistryKeyType,
  ConditionParamsType,
} from "@/shared/common/types/components-registry";

const initialComponentRegistry: ComponentRegistryStateType = {
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
};

function _useComponentsRegistry() {
  const componentRegistry = shallowRef<ComponentRegistryStateType>(initialComponentRegistry);

  function registerItem<T extends keyof ComponentsRegistryType, C extends ComponentsRegistryType[T]>(
    type: T,
    id: string,
    item: C,
  ) {
    if (!componentRegistry.value[type]) {
      componentRegistry.value[type] = {};
    }
    if (!componentRegistry.value[type][id]) {
      componentRegistry.value[type][id] = item;
    } else {
      Logger.warn(`useComponentsRegistry: Component "${type}/${id}" already registered`);
    }
  }

  function unregisterComponent<T extends keyof ComponentsRegistryType>(type: T, id: string) {
    delete componentRegistry.value[type]?.[id];
  }

  function getRegistryItem(type: keyof ComponentsRegistryType, id: string) {
    return componentRegistry.value[type]?.[id];
  }

  function getRegistryItems(type: keyof ComponentsRegistryType) {
    return shallowReadonly(componentRegistry.value[type] ?? {});
  }

  function getComponent<T extends keyof ComponentRegistryStateType>(
    type: T,
    id: string,
  ): ComponentTypeByRegistryKeyType<T> | null {
    return componentRegistry.value[type]?.[id]?.component as ComponentTypeByRegistryKeyType<T> | null;
  }

  function isComponentRegistered<T extends keyof ComponentsRegistryType>(type: T, id: string) {
    return componentRegistry.value[type]?.[id]?.component !== undefined;
  }

  function shouldRenderComponent(
    type: keyof ComponentsRegistryType,
    id: string,
    params?: ConditionParamsType<ComponentsRegistryType[keyof ComponentsRegistryType]>,
  ) {
    if (typeof componentRegistry.value[type]?.[id]?.condition === "function") {
      try {
        return componentRegistry.value[type]?.[id]?.condition?.(...(params || []));
      } catch (error) {
        Logger.error(`useComponentsRegistry: Error in condition for component "${type}/${id}"`, error);
        return false;
      }
    }
    return true;
  }

  function getComponentProps(type: keyof ComponentsRegistryType, id: string) {
    return componentRegistry.value[type]?.[id]?.props ?? {};
  }

  if (IS_DEVELOPMENT) {
    window.vcComponentsRegistry = {
      registryItems: componentRegistry.value,

      registerComponent: registerItem,
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
    registryItems: componentRegistry.value,

    registerComponent: registerItem,
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
