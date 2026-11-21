import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import type { CustomSectionDirectiveType, ICustomSectionBehavior } from "../types";

export { REPEATED_COPY_ATTRIBUTE } from "./constants";

type MountArgumentsType = Parameters<NonNullable<CustomSectionDirectiveType["mounted"]>>;

interface ILoadedBehavior {
  /** Applies the behavior once its directive loads; an element gone by then is left alone. */
  lazy: CustomSectionDirectiveType;
  pending?: Promise<CustomSectionDirectiveType | undefined>;
  loaded?: CustomSectionDirectiveType;
}

const loadedBehaviors = new WeakMap<ICustomSectionBehavior, ILoadedBehavior>();

export function preloadBehaviors(behaviors: Iterable<ICustomSectionBehavior>): void {
  for (const behavior of behaviors) {
    void loadDirective(behavior);
  }
}

export function getBehaviorDirective(behavior: ICustomSectionBehavior): CustomSectionDirectiveType {
  return getLoadedBehavior(behavior).lazy;
}

function getLoadedBehavior(behavior: ICustomSectionBehavior): ILoadedBehavior {
  let entry = loadedBehaviors.get(behavior);

  if (!entry) {
    entry = { lazy: createLazyDirective(behavior) };
    loadedBehaviors.set(behavior, entry);
  }

  return entry;
}

function loadDirective(behavior: ICustomSectionBehavior): Promise<CustomSectionDirectiveType | undefined> {
  const entry = getLoadedBehavior(behavior);
  entry.pending ??= importDirective(behavior, entry);

  return entry.pending;
}

async function importDirective(
  behavior: ICustomSectionBehavior,
  entry: ILoadedBehavior,
): Promise<CustomSectionDirectiveType | undefined> {
  try {
    entry.loaded = await behavior.directive();
    return entry.loaded;
  } catch (error) {
    ignoreChunkLoadFailure(error);
    Logger.error("[custom-sections] Failed to load a behavior", error);
    entry.pending = undefined;
    return undefined;
  }
}

function createLazyDirective(behavior: ICustomSectionBehavior): CustomSectionDirectiveType {
  /** The latest binding of an element mounted before its behavior loaded. */
  const waiting = new WeakMap<HTMLElement, MountArgumentsType>();
  /** Elements that left the page before their behavior loaded: the behavior never saw them. */
  const gone = new WeakSet<HTMLElement>();

  function getLoaded(): CustomSectionDirectiveType | undefined {
    return loadedBehaviors.get(behavior)?.loaded;
  }

  async function mountWhenLoaded(element: HTMLElement): Promise<void> {
    const directive = await loadDirective(behavior);
    const args = waiting.get(element);

    if (directive && args) {
      waiting.delete(element);
      directive.mounted?.(...args);
    }
  }

  return {
    mounted(element, binding, vnode, prevVNode) {
      const directive = getLoaded();

      if (directive) {
        directive.mounted?.(element, binding, vnode, prevVNode);
        return;
      }

      waiting.set(element, [element, binding, vnode, prevVNode]);
      void mountWhenLoaded(element);
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
