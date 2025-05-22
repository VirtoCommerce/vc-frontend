import { createGlobalState } from "@vueuse/core";
import { shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { initialExtensionRegistry } from "@/shared/common/constants/initialExtensionRegistry";
import type { ExtensionCategoryType, ExtensionRegistryStateType } from "@/shared/common/types/extensionRegistry";

function _useExtensionRegistry() {
  const entries = shallowRef<ExtensionRegistryStateType>(initialExtensionRegistry);

  function register<C extends ExtensionCategoryType, N extends string>(
    category: C,
    name: N,
    item: ExtensionRegistryStateType[C][N],
  ) {
    if (!entries.value[category]) {
      entries.value[category] = {};
    }
    if (!entries.value[category][name]) {
      entries.value[category][name] = item;
    } else {
      Logger.warn(`useExtensionRegistry: Component "${category}/${name}" already registered`);
    }
  }

  function unregister<C extends ExtensionCategoryType>(category: C, name: string) {
    delete entries.value[category]?.[name];
  }

  function getEntry<C extends ExtensionCategoryType>(category: C, name: string) {
    return entries.value[category]?.[name];
  }

  function getEntries<C extends ExtensionCategoryType>(category: C) {
    return shallowReadonly(entries.value[category] ?? {});
  }

  function getComponent<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ) {
    return entries.value[category]?.[name]?.component ?? null;
  }

  function isRegistered<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ) {
    return entries.value[category]?.[name]?.component !== undefined;
  }

  function canRender<C extends ExtensionCategoryType, N extends string>(
    category: C,
    name: N,
    parameter: Parameters<NonNullable<ExtensionRegistryStateType[C][N]["condition"]>>[0],
  ): boolean {
    if (!isRegistered(category, name)) {
      return false;
    }

    const condition = entries.value[category]?.[name]?.condition as ExtensionRegistryStateType[C][N]["condition"];

    if (condition && typeof condition === "function") {
      try {
        return condition(parameter);
      } catch (error) {
        Logger.error(`useExtensionRegistry: Error in condition for component "${category}/${name}"`, error);
        return false;
      }
    }

    return true;
  }

  function getProps<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ): ExtensionRegistryStateType[C][N]["props"] {
    return entries.value[category]?.[name]?.props;
  }

  // To debug in development mode
  if (IS_DEVELOPMENT) {
    window.VCExtensionRegistry = {
      entries,

      register,
      unregister,

      getComponent,
      getEntry,
      getEntries,
      getProps,

      isRegistered,
      canRender,
    };
  }

  return {
    entries,

    register,
    unregister,

    getComponent,
    getEntry,
    getEntries,
    getProps,

    isRegistered,
    canRender,
  };
}

export const useExtensionRegistry = createGlobalState(_useExtensionRegistry);
