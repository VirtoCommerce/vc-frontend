import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { Component } from "vue";

export type LinkElementType = {
  id: string;
  component: Component<{ item: ExtendedMenuLinkType }, Record<string, unknown>, unknown>;
};

export type MobileHeaderElementType = {
  id: string;
  component: Component;
};

type ComponentRegistryType = {
  header: { [key: string]: LinkElementType["component"] };
  mobileMenu: { [key: string]: LinkElementType["component"] };
  account: { [key: string]: LinkElementType["component"] };
  mobileHeader: { [key: string]: MobileHeaderElementType["component"] };
};

function _useComponentsRegistry() {
  const componentRegistry = shallowRef<ComponentRegistryType>({
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
  });

  function registerComponent<T extends keyof ComponentRegistryType>(
    type: T,
    element: { id: string; component: ComponentRegistryType[T][string] },
  ) {
    if (!componentRegistry.value[type][element.id]) {
      componentRegistry.value[type][element.id] = element.component;
    }
  }

  function unregisterComponent<T extends keyof ComponentRegistryType>(type: T, id: string) {
    delete componentRegistry.value[type][id];
  }

  function getComponents(type: keyof ComponentRegistryType) {
    return shallowReadonly(componentRegistry.value[type]);
  }

  if (IS_DEVELOPMENT) {
    window.componentsRegistry = {
      components: componentRegistry.value,
      registerComponent,
      getComponents,
    };
  }

  return {
    headerLinkComponents: shallowReadonly(componentRegistry.value.header),
    mobileLinkComponents: shallowReadonly(componentRegistry.value.mobileMenu),
    accountLinkComponents: shallowReadonly(componentRegistry.value.account),
    mobileHeaderComponents: shallowReadonly(componentRegistry.value.mobileHeader),

    getComponents,
    registerComponent,
    unregisterComponent,
  };
}

export const useComponentsRegistry = createGlobalState(_useComponentsRegistry);
