import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type { ComponentRegistryStateType } from "@/shared/common/types/extension-registry";

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
  const entries = shallowRef<ComponentRegistryStateType>(initialComponentRegistry);

  function register<T extends keyof ComponentRegistryStateType, I extends string>(
    type: T,
    id: I,
    item: ComponentRegistryStateType[T][I],
  ) {
    if (!entries.value[type]) {
      entries.value[type] = {};
    }
    if (!entries.value[type][id]) {
      entries.value[type][id] = item;
    } else {
      Logger.warn(`useExtensionRegistry: Component "${type}/${id}" already registered`);
    }
  }

  function unregister<T extends keyof ComponentRegistryStateType>(type: T, id: string) {
    delete entries.value[type]?.[id];
  }

  function getEntry<T extends keyof ComponentRegistryStateType>(type: T, id: string) {
    return entries.value[type]?.[id];
  }

  function getEntries<T extends keyof ComponentRegistryStateType>(type: T) {
    return shallowReadonly(entries.value[type] ?? {});
  }

  function getComponent<T extends keyof ComponentRegistryStateType, I extends keyof ComponentRegistryStateType[T]>(
    type: T,
    id: I,
  ) {
    return entries.value[type]?.[id]?.component ?? null;
  }

  function isRegistered<T extends keyof ComponentRegistryStateType, I extends keyof ComponentRegistryStateType[T]>(
    type: T,
    id: I,
  ) {
    return entries.value[type]?.[id]?.component !== undefined;
  }

  function canRender<T extends keyof ComponentRegistryStateType, I extends string>(
    type: T,
    id: I,
    parameter: Parameters<NonNullable<ComponentRegistryStateType[T][I]["condition"]>>[0],
  ): boolean {
    const condition = entries.value[type]?.[id]?.condition as ComponentRegistryStateType[T][I]["condition"];

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

  function getProps<T extends keyof ComponentRegistryStateType, I extends keyof ComponentRegistryStateType[T]>(
    type: T,
    id: I,
  ): ComponentRegistryStateType[T][I]["props"] {
    return entries.value[type]?.[id]?.props;
  }

  if (IS_DEVELOPMENT) {
    window.VCExtensionRegistry = {
      entries,

      register,
      unregister,

      getComponent,
      getEntry,
      getEntries,

      getProps,

      isRegistered,
      canRender,
    };
  }

  return {
    entries,

    register,
    unregister,

    getComponent,
    getEntry,
    getEntries,

    getProps,

    isRegistered,
    canRender,
  };
}

export const useExtensionRegistry = createGlobalState(_useExtensionRegistry);
