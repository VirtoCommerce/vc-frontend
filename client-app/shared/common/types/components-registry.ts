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

export type ComponentRegistryType = {
  header: { [key: string]: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }> };
  mobileMenu: { [key: string]: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }> };
  account: { [key: string]: ComponentRegistryItemType<{ item: ExtendedMenuLinkType }> };
  mobileHeader: { [key: string]: ComponentRegistryItemType };
};
