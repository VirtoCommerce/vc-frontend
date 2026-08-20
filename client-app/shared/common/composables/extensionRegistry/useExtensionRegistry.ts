import { createGlobalState } from "@vueuse/core";
import { pick } from "lodash-es";
import { shallowReadonly, shallowRef, triggerRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { initialExtensionRegistry } from "@/shared/common/constants/initialExtensionRegistry";
import type { ExtensionCategoryType, ExtensionRegistryStateType } from "@/shared/common/types/extensionRegistry";
import type {
  ConditionParamType,
  ContributionType,
  ReplacePropsType,
} from "@/shared/common/types/extensionRegistryMap";

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
      // shallowRef only tracks `.value` reassignment, so a nested write needs an explicit trigger
      // or a plugin registering after its host mounted would never appear.
      triggerRef(entries);
    } else {
      Logger.warn(`useExtensionRegistry: Component "${category}/${name}" already registered`);
    }
  }

  function unregister<C extends ExtensionCategoryType>(category: C, name: string) {
    if (!entries.value[category]?.[name]) {
      return;
    }

    delete entries.value[category]?.[name];
    triggerRef(entries);
  }

  function getEntries<C extends ExtensionCategoryType>(category: C, names?: string[]) {
    if (names) {
      return shallowReadonly(pick(entries.value[category], names));
    }
    return shallowReadonly(entries.value[category] ?? {});
  }

  function getComponent<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ) {
    return entries.value[category]?.[name]?.component ?? null;
  }

  /** Answers whether the entry has a component, not whether one is registered: a decorate entry is false. */
  function isRegistered<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ) {
    return Boolean(entries.value[category]?.[name]?.component);
  }

  /** The entry's `condition` alone; true when it has none. Unlike `canRender`, ignores the component. */
  function passesCondition<C extends ExtensionCategoryType>(
    category: C,
    name: string,
    parameter: ConditionParamType<C>,
  ): boolean {
    const condition = entries.value[category]?.[name]?.condition;

    if (typeof condition !== "function") {
      return true;
    }

    try {
      return (condition as (parameter: ConditionParamType<C>) => boolean)(parameter);
    } catch (error) {
      Logger.error(
        `useExtensionRegistry: Error in condition for component "${String(category)}/${String(name)}"`,
        error,
      );
      return false;
    }
  }

  /**
   * Whether a REPLACE entry would render. A decorate entry has no component, so this is false for
   * it — never gate a decorate-capable extension point on this, or the contribution silently dies.
   */
  function canRender<C extends ExtensionCategoryType>(
    category: C,
    name: string,
    parameter: ConditionParamType<C>,
  ): boolean {
    return isRegistered(category, name) && passesCondition(category, name, parameter);
  }

  function getProps<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ): ReplacePropsType<C> {
    const entry = entries.value[category]?.[name] as { props?: ReplacePropsType<C> } | undefined;
    return entry?.props;
  }

  /** The entry's `use()`, for the extension point to call from its own setup. */
  function getContribution<C extends ExtensionCategoryType>(
    category: C,
    name: string,
  ): (() => ContributionType<C>) | undefined {
    const entry = entries.value[category]?.[name] as { use?: () => ContributionType<C> } | undefined;
    return typeof entry?.use === "function" ? entry.use : undefined;
  }

  // To debug in development mode
  if (IS_DEVELOPMENT) {
    window.VCExtensionRegistry = {
      entries,

      register,
      unregister,

      getComponent,
      getContribution,
      isRegistered,
      passesCondition,
      getEntries,
      getProps,

      canRender,
    };
  }

  return {
    entries,

    register,
    unregister,

    getComponent,
    getContribution,
    isRegistered,
    passesCondition,
    getEntries,
    getProps,

    canRender,
  };
}

export const useExtensionRegistry = createGlobalState(_useExtensionRegistry);
