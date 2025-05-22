import type { Product } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { Component } from "vue";

export type ComponentRegistryItemType<
  Props = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  component: Component;
  condition?: Condition;
  props?: Props;
};

export type ComponentsRegistryType = {
  headerMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  accountMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  mobileHeader: ComponentRegistryItemType;
  productCard: ComponentRegistryItemType<
    { product?: Product; isTextShown?: boolean; lazy?: boolean },
    (product: Product) => boolean
  >;
};

export type ComponentRegistryStateType = {
  [K in keyof ComponentsRegistryType]: Record<string, ComponentsRegistryType[K]>;
};

export type ComponentRegistryKeysType = keyof ComponentsRegistryType;
