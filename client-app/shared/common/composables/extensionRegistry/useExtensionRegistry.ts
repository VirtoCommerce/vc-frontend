import { createGlobalState } from "@vueuse/core";
import { pick } from "lodash-es";
import { shallowReadonly, shallowRef, triggerRef } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { initialExtensionRegistry } from "@/shared/common/constants/initialExtensionRegistry";
import type { ExtensionCategoryType, ExtensionRegistryStateType } from "@/shared/common/types/extensionRegistry";
import type {
  ConditionParamType,
  ContributionEntryOfType,
  ExtensionCategoryMapType,
  ContributionType,
  DecorateCapableCategoryType,
  ReplaceEntryOfType,
  ReplacePropsType,
} from "@/shared/common/types/extensionRegistryMap";

type AnyEntryType = ExtensionCategoryMapType[ExtensionCategoryType];

function _useExtensionRegistry() {
  const entries = shallowRef<ExtensionRegistryStateType>(initialExtensionRegistry);

  // The store's value type is per-category, and TypeScript refuses a write through a generic index.
  // The two public wrappers below are what constrain the entry to its category's shape; this
  // addresses the store by the widest one.
  function add(category: ExtensionCategoryType, name: string, item: AnyEntryType) {
    const store = entries.value as Record<string, Record<string, AnyEntryType> | undefined>;
    const bucket = (store[category] ??= {});

    if (bucket[name]) {
      Logger.warn(`useExtensionRegistry: Component "${category}/${name}" already registered`);
      return;
    }

    bucket[name] = item;
    // shallowRef only tracks `.value` reassignment, so a nested write needs an explicit trigger
    // or a plugin registering after its host mounted would never appear.
    triggerRef(entries);
  }

  /** Registers a component that REPLACES the host's markup at this extension point. */
  function register<C extends ExtensionCategoryType>(category: C, name: string, item: ReplaceEntryOfType<C>) {
    add(category, name, item);
  }

  /**
   * Registers data the host binds into its OWN markup (`use()` runs in the extension point's setup
   * and is disposed with it, so it may fetch). Only categories that declared a contributed shape
   * accept one — the rest render no fallback slot to receive it, so an entry there would be a
   * silent no-op. That is why this is a separate entry point: a caller whose `category` widens to
   * the whole union fails here on the argument instead of landing in `register()`'s wider shape.
   */
  function registerContribution<C extends DecorateCapableCategoryType>(
    category: C,
    name: string,
    item: ContributionEntryOfType<C>,
  ) {
    add(category, name, item);
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
      registerContribution,
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
    registerContribution,
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
