import { createGlobalState } from "@vueuse/core";
import { pick } from "lodash-es";
import { shallowReadonly, shallowRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { initialExtensionRegistry } from "@/shared/common/constants/initialExtensionRegistry";
import type { ExtensionCategoryType, ExtensionRegistryStateType } from "@/shared/common/types/extensionRegistry";
import type { ContributionType, ReplacePropsType } from "@/shared/common/types/extensionRegistryMap";

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

  /** Whether the entry renders its own markup — the question both extension points ask. */
  function hasComponent<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ) {
    return Boolean(entries.value[category]?.[name]?.component);
  }

  /**
   * @deprecated Answers "has a component", not "is registered" — a decorate-mode entry is
   * registered and returns false here. Use {@link hasComponent}.
   */
  const isRegistered = hasComponent;

  type ConditionParamType<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]> =
    NonNullable<ExtensionRegistryStateType[C][N]["condition"]> extends (arg: infer P) => boolean ? P : unknown;

  function canRender<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
    parameter: ConditionParamType<C, N>,
  ): boolean {
    if (!hasComponent(category, name)) {
      return false;
    }

    const condition = entries.value[category]?.[name]?.condition as ExtensionRegistryStateType[C][N]["condition"];

    if (condition && typeof condition === "function") {
      try {
        return (condition as (arg: ConditionParamType<C, N>) => boolean)(parameter);
      } catch (error) {
        Logger.error(
          `useExtensionRegistry: Error in condition for component "${String(category)}/${String(name)}"`,
          error,
        );
        return false;
      }
    }

    return true;
  }

  function getProps<C extends ExtensionCategoryType, N extends keyof ExtensionRegistryStateType[C]>(
    category: C,
    name: N,
  ): ReplacePropsType<C> {
    const entry = entries.value[category]?.[name] as { props?: ReplacePropsType<C> } | undefined;
    return entry?.props;
  }

  /**
   * The entry's `use()`, for the extension point to call from its own setup. Only a category that
   * declares a contributed shape can carry one.
   */
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
      hasComponent,
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
    getContribution,
    hasComponent,
    getEntries,
    getProps,

    isRegistered,
    canRender,
  };
}

export const useExtensionRegistry = createGlobalState(_useExtensionRegistry);
