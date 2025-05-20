import { createGlobalState } from "@vueuse/core";
import { defineAsyncComponent, shallowReadonly, shallowRef } from "vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { DefineComponent } from "vue";

export type LinkElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: DefineComponent<{ item: ExtendedMenuLinkType }, Record<string, any>, any>;
};

export type MobileHeaderElementType = {
  id: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: DefineComponent<Record<string, any>, Record<string, any>, any>;
};

export type ComponentType = "header" | "mobileMenu" | "account" | "mobileHeader";

type ComponentRegistry = {
  header: { [key: string]: LinkElementType["component"] };
  mobileMenu: { [key: string]: LinkElementType["component"] };
  account: { [key: string]: LinkElementType["component"] };
  mobileHeader: { [key: string]: MobileHeaderElementType["component"] };
};

function _useCustomLinkComponents() {
  const componentRegistry = shallowRef<ComponentRegistry>({
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

  function registerCustomLinkComponent(type: Exclude<ComponentType, "mobileHeader">, element: LinkElementType): void;
  function registerCustomLinkComponent(type: "mobileHeader", element: MobileHeaderElementType): void;
  function registerCustomLinkComponent(type: ComponentType, element: LinkElementType | MobileHeaderElementType) {
    if (!componentRegistry.value[type][element.id]) {
      if (type === "mobileHeader") {
        (componentRegistry.value[type] as Record<string, MobileHeaderElementType["component"]>)[element.id] = (
          element as MobileHeaderElementType
        ).component;
      } else {
        (componentRegistry.value[type] as Record<string, LinkElementType["component"]>)[element.id] = (
          element as LinkElementType
        ).component;
      }
    }
  }

  function getCustomLinkComponents(type: ComponentType) {
    return shallowReadonly(componentRegistry.value[type]);
  }

  return {
    headerLinkComponents: shallowReadonly(componentRegistry.value.header),
    mobileLinkComponents: shallowReadonly(componentRegistry.value.mobileMenu),
    accountLinkComponents: shallowReadonly(componentRegistry.value.account),
    mobileHeaderComponents: shallowReadonly(componentRegistry.value.mobileHeader),

    getCustomLinkComponents,
    registerCustomLinkComponent,
  };
}

export const useCustomLinkComponents = createGlobalState(_useCustomLinkComponents);
