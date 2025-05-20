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

export type ComponentRegistryType = {
  header: { [key: string]: ComponentType<{ item: ExtendedMenuLinkType }> };
  mobileMenu: { [key: string]: ComponentType<{ item: ExtendedMenuLinkType }> };
  account: { [key: string]: ComponentType<{ item: ExtendedMenuLinkType }> };
  mobileHeader: { [key: string]: ComponentType };
};
