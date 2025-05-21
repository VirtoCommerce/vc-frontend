import type { Product } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { Component, ComputedOptions, EmitsOptions, MethodOptions } from "vue";

type ComponentType<Props = unknown, Emits extends EmitsOptions = Record<string, never>> = Component<
  Props, // Props
  unknown, // RawBindings
  unknown, // Data
  ComputedOptions, // Computed
  MethodOptions, // Methods
  Emits // Emits
>;

type ComponentRegistryItemType<Props = unknown, Emits extends EmitsOptions = Record<string, never>> = {
  component: ComponentType<Props, Emits>;
  condition?: (...args: unknown[]) => boolean;
  props?: Props;
};

export type RawConditionType<T> = T extends { condition?: infer C } ? C : never;

export type ConditionParamsType<T> = RawConditionType<T> extends (...args: infer P) => boolean ? P : never;

export type ComponentsRegistryType = {
  headerMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  accountMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  mobileHeader?: ComponentRegistryItemType;
  productCard?: ComponentRegistryItemType<{ product: Product; isTextShown?: boolean; lazy?: boolean }>;
};

export type ComponentRegistryStateType = {
  [K in keyof ComponentsRegistryType]: Record<string, ComponentsRegistryType[K]>;
};

export type ComponentTypeByRegistryKeyType<T extends keyof ComponentRegistryStateType> = NonNullable<
  ComponentRegistryStateType[T]
>[string] extends { component: infer C }
  ? C
  : never;
