import { createGlobalState } from "@vueuse/core";
import { shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import type { CustomSectionDirectiveType, ICustomSectionBehavior } from "../types";

export { REPEATED_COPY_ATTRIBUTE, SECTION_TYPE_ATTRIBUTE } from "./constants";
export { useReducedMotion } from "./useReducedMotion";

type MountArgumentsType = Parameters<NonNullable<CustomSectionDirectiveType["mounted"]>>;

interface ILoadedBehavior {
  /** Applies the behavior once its directive loads; an element gone by then is left alone. */
  lazy: CustomSectionDirectiveType;
  /** Elements in the page before the directive loaded, with their latest binding. */
  waiting: Map<HTMLElement, MountArgumentsType>;
  pending?: Promise<CustomSectionDirectiveType | undefined>;
  loaded?: CustomSectionDirectiveType;
}

const loadedBehaviors = new WeakMap<ICustomSectionBehavior, ILoadedBehavior>();
const useFailedBehaviors = createGlobalState(() => shallowRef<ReadonlySet<ICustomSectionBehavior>>(new Set()));

export function preloadBehaviors(behaviors: Iterable<ICustomSectionBehavior>): void {
  for (const behavior of behaviors) {
    void loadDirective(behavior);
  }
}

export function getBehaviorDirective(behavior: ICustomSectionBehavior): CustomSectionDirectiveType {
  return getLoadedBehavior(behavior).lazy;
}

/** Reactive: until a later load succeeds, a text behavior's elements show the template's text. */
export function hasBehaviorFailed(behavior: ICustomSectionBehavior): boolean {
  return useFailedBehaviors().value.has(behavior);
}

function getLoadedBehavior(behavior: ICustomSectionBehavior): ILoadedBehavior {
  let entry = loadedBehaviors.get(behavior);

  if (!entry) {
    const waiting = new Map<HTMLElement, MountArgumentsType>();
    entry = { waiting, lazy: createLazyDirective(behavior, waiting) };
    loadedBehaviors.set(behavior, entry);
  }

  return entry;
}

function loadDirective(behavior: ICustomSectionBehavior): Promise<CustomSectionDirectiveType | undefined> {
  const entry = getLoadedBehavior(behavior);
  entry.pending ??= importDirective(behavior, entry);

  return entry.pending;
}

/** A failed load is tried again by the next element or section that needs the behavior. */
async function importDirective(
  behavior: ICustomSectionBehavior,
  entry: ILoadedBehavior,
): Promise<CustomSectionDirectiveType | undefined> {
  let loaded: CustomSectionDirectiveType;

  try {
    loaded = await behavior.directive();
  } catch (error) {
    ignoreChunkLoadFailure(error);
    Logger.error("[custom-sections] Failed to load a behavior", error);
    entry.pending = undefined;
    setFailed(behavior, true);
    return undefined;
  }

  entry.loaded = loaded;
  setFailed(behavior, false);
  mountWaiting(entry, loaded);
  return loaded;
}

/** One element's failed setup leaves the others to mount. */
function mountWaiting(entry: ILoadedBehavior, loaded: CustomSectionDirectiveType): void {
  const waiting = [...entry.waiting.values()];
  entry.waiting.clear();

  for (const args of waiting) {
    try {
      loaded.mounted?.(...args);
    } catch (error) {
      Logger.error("[custom-sections] A behavior failed to start on an element", error);
    }
  }
}

function setFailed(behavior: ICustomSectionBehavior, isFailed: boolean): void {
  const failed = useFailedBehaviors();

  if (failed.value.has(behavior) !== isFailed) {
    const next = new Set(failed.value);
    next[isFailed ? "add" : "delete"](behavior);
    failed.value = next;
  }
}

function createLazyDirective(
  behavior: ICustomSectionBehavior,
  waiting: Map<HTMLElement, MountArgumentsType>,
): CustomSectionDirectiveType {
  /** Elements that left the page before their behavior loaded: the behavior never saw them. */
  const gone = new WeakSet<HTMLElement>();

  function getLoaded(): CustomSectionDirectiveType | undefined {
    return loadedBehaviors.get(behavior)?.loaded;
  }

  return {
    mounted(element, binding, vnode, prevVNode) {
      const directive = getLoaded();

      if (directive) {
        directive.mounted?.(element, binding, vnode, prevVNode);
        return;
      }

      waiting.set(element, [element, binding, vnode, prevVNode]);
      void loadDirective(behavior);
    },
    beforeUpdate(element, binding, vnode, prevVNode) {
      if (!waiting.has(element)) {
        getLoaded()?.beforeUpdate?.(element, binding, vnode, prevVNode);
      }
    },
    updated(element, binding, vnode, prevVNode) {
      if (waiting.has(element)) {
        waiting.set(element, [element, binding, vnode, null]);
        return;
      }

      getLoaded()?.updated?.(element, binding, vnode, prevVNode);
    },
    beforeUnmount(element, binding, vnode, prevVNode) {
      if (waiting.delete(element)) {
        gone.add(element);
        return;
      }

      getLoaded()?.beforeUnmount?.(element, binding, vnode, prevVNode);
    },
    unmounted(element, binding, vnode, prevVNode) {
      if (!gone.delete(element)) {
        getLoaded()?.unmounted?.(element, binding, vnode, prevVNode);
      }
    },
  };
}
