import type { Product } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { Component } from "vue";

export type ExtensionEntryType<
  Props = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  component: Component;
  condition?: Condition;
  props?: Props;
};

export type ExtensionCategoryMapType = {
  headerMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  accountMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileHeader: ExtensionEntryType;
  productCard: ExtensionEntryType<
    { product?: Product; isTextShown?: boolean; lazy?: boolean },
    (product: Product) => boolean
  >;
};

export type ExtensionRegistryStateType = {
  [K in keyof ExtensionCategoryMapType]: Record<string, ExtensionCategoryMapType[K]>;
};

export type ExtensionCategoryType = keyof ExtensionCategoryMapType;
