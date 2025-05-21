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

export type ComponentRegistryItemType<
  Props = unknown,
  Emits extends EmitsOptions = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  component: ComponentType<Props, Emits>;
  condition?: Condition;
  props?: Partial<Props>;
};

export type ComponentsRegistryType = {
  headerMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  accountMenu: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }>;
  mobileHeader: ComponentRegistryItemType;
  productCard: ComponentRegistryItemType<
    { product: Product; isTextShown?: boolean; lazy?: boolean },
    [],
    (product: Product) => boolean
  >;
};

export type ComponentRegistryStateType = {
  [K in keyof ComponentsRegistryType]: Record<string, ComponentsRegistryType[K]>;
};

// export type RegistryItemPropertyType<
//   T extends keyof ComponentRegistryStateType,
//   Prop extends keyof ComponentRegistryItemType,
// > = NonNullable<ComponentRegistryStateType[T]>[string] extends { [K in Prop]: infer P } ? P : never;
