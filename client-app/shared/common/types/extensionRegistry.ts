import type { ExtensionCategoryMapType } from "@/shared/common/types/extensionRegistryMap";
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

export type ExtensionRegistryStateType = {
  [K in keyof ExtensionCategoryMapType]: Record<string, ExtensionCategoryMapType[K]>;
};

export type ExtensionCategoryType = keyof ExtensionCategoryMapType;
