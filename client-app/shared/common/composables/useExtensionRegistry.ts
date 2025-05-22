import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type { ComponentRegistryStateType } from "@/shared/common/types/components-registry";

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
  mobileHeader: {},
  productCard: {},
};

function _useExtensionRegistry() {
  const componentRegistry = shallowRef<ComponentRegistryStateType>(initialComponentRegistry);

  function registerItem<T extends keyof ComponentRegistryStateType, I extends string>(
    type: T,
    id: I,
    item: ComponentRegistryStateType[T][I],
  ) {
    if (!componentRegistry.value[type]) {
      componentRegistry.value[type] = {};
    }
    if (!componentRegistry.value[type][id]) {
      componentRegistry.value[type][id] = item;
    } else {
      Logger.warn(`useExtensionRegistry: Component "${type}/${id}" already registered`);
    }
  }

  function unregisterComponent<T extends keyof ComponentRegistryStateType>(type: T, id: string) {
    delete componentRegistry.value[type]?.[id];
  }

  function getRegistryItem<T extends keyof ComponentRegistryStateType>(type: T, id: string) {
    return componentRegistry.value[type]?.[id];
  }

  function getRegistryItems<T extends keyof ComponentRegistryStateType>(type: T) {
    return shallowReadonly(componentRegistry.value[type] ?? {});
  }

  function getComponent<T extends keyof ComponentRegistryStateType, I extends keyof ComponentRegistryStateType[T]>(
    type: T,
    id: I,
  ) {
    return componentRegistry.value[type]?.[id]?.component ?? null;
  }

  function isComponentRegistered<
    T extends keyof ComponentRegistryStateType,
    I extends keyof ComponentRegistryStateType[T],
  >(type: T, id: I) {
    return componentRegistry.value[type]?.[id]?.component !== undefined;
  }

  function shouldRender<T extends keyof ComponentRegistryStateType, I extends string>(
    type: T,
    id: I,
    parameter: Parameters<NonNullable<ComponentRegistryStateType[T][I]["condition"]>>[0],
  ): boolean {
    const condition = componentRegistry.value[type]?.[id]?.condition as ComponentRegistryStateType[T][I]["condition"];

    if (condition && typeof condition === "function") {
      try {
        return condition(parameter);
      } catch (error) {
        Logger.error(`useExtensionRegistry: Error in condition for component "${type}/${id}"`, error);
        return false;
      }
    }
    return true;
  }

  function getComponentProps<T extends keyof ComponentRegistryStateType, I extends keyof ComponentRegistryStateType[T]>(
    type: T,
    id: I,
  ): ComponentRegistryStateType[T][I]["props"] {
    return componentRegistry.value[type]?.[id]?.props;
  }

  if (IS_DEVELOPMENT) {
    window.VCExtensionRegistry = {
      registryItems: componentRegistry.value,

      registerComponent: registerItem,
      unregisterComponent,

      getComponent,
      getRegistryItem,
      getRegistryItems,

      getComponentProps,

      isComponentRegistered,
      shouldRender,
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
    shouldRender,
  };
}

export const useExtensionRegistry = createGlobalState(_useExtensionRegistry);
