import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import type { CustomSectionDirectiveType, ICustomSectionBehavior } from "../types";

export { REPEATED_COPY_ATTRIBUTE } from "./constants";

type MountArgumentsType = Parameters<NonNullable<CustomSectionDirectiveType["mounted"]>>;

const loadedDirectives = new WeakMap<ICustomSectionBehavior, CustomSectionDirectiveType>();
const pendingDirectives = new WeakMap<ICustomSectionBehavior, Promise<CustomSectionDirectiveType | undefined>>();
const lazyDirectives = new WeakMap<ICustomSectionBehavior, CustomSectionDirectiveType>();

export function preloadBehaviors(behaviors: Iterable<ICustomSectionBehavior>): void {
  for (const behavior of behaviors) {
    void loadDirective(behavior);
  }
}

/** Applies the behavior once its directive loads; an element gone by then is left alone. */
export function getBehaviorDirective(behavior: ICustomSectionBehavior): CustomSectionDirectiveType {
  let directive = lazyDirectives.get(behavior);

  if (!directive) {
    directive = createLazyDirective(behavior);
    lazyDirectives.set(behavior, directive);
  }

  return directive;
}

function loadDirective(behavior: ICustomSectionBehavior): Promise<CustomSectionDirectiveType | undefined> {
  let pending = pendingDirectives.get(behavior);

  if (!pending) {
    pending = importDirective(behavior);
    pendingDirectives.set(behavior, pending);
  }

  return pending;
}

async function importDirective(behavior: ICustomSectionBehavior): Promise<CustomSectionDirectiveType | undefined> {
  try {
    const directive = await behavior.directive();
    loadedDirectives.set(behavior, directive);
    return directive;
  } catch (error) {
    ignoreChunkLoadFailure(error);
    Logger.error("[custom-sections] Failed to load a behavior", error);
    pendingDirectives.delete(behavior);
    return undefined;
  }
}

function createLazyDirective(behavior: ICustomSectionBehavior): CustomSectionDirectiveType {
  /** The latest binding of an element mounted before its behavior loaded. */
  const waiting = new WeakMap<HTMLElement, MountArgumentsType>();

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
      const directive = loadedDirectives.get(behavior);

      if (directive) {
        directive.mounted?.(element, binding, vnode, prevVNode);
        return;
      }

      waiting.set(element, [element, binding, vnode, prevVNode]);
      void mountWhenLoaded(element);
    },
    updated(element, binding, vnode, prevVNode) {
      if (waiting.has(element)) {
        waiting.set(element, [element, binding, vnode, null]);
        return;
      }

      loadedDirectives.get(behavior)?.updated?.(element, binding, vnode, prevVNode);
    },
    unmounted(element, binding, vnode, prevVNode) {
      if (!waiting.delete(element)) {
        loadedDirectives.get(behavior)?.unmounted?.(element, binding, vnode, prevVNode);
      }
    },
  };
}
