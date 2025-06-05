import type { ExtensionCategoryMapType } from "@/shared/common/types/extensionRegistryMap";

export type ExtensionRegistryStateType = {
  [K in keyof ExtensionCategoryMapType]: Record<string, ExtensionCategoryMapType[K]>;
};

export type ExtensionCategoryType = keyof ExtensionCategoryMapType;
