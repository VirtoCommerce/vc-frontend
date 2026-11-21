import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import type { BehaviorDirectiveType } from "./define-behavior";

export { MARQUEE_COPY_ATTRIBUTE } from "./constants";

/** Each switches on a directive; the directive's value is the attribute's, bindings resolved. */
export const BEHAVIOR_ATTRIBUTES = [
  "data-inview",
  "data-scroll-progress",
  "data-pointer",
  "data-count-up",
  "data-countdown",
  "data-copy",
  "data-marquee",
] as const;

export type BehaviorType = (typeof BEHAVIOR_ATTRIBUTES)[number];

export const BEHAVIOR_OPTION_ATTRIBUTES = [
  "data-inview-threshold",
  "data-inview-once",
  "data-count-up-duration",
  "data-count-up-decimals",
  "data-countdown-part",
] as const;

/** One chunk per behavior, loaded the first time a template uses it. */
const BEHAVIOR_LOADERS: Record<BehaviorType, () => Promise<BehaviorDirectiveType>> = {
  "data-inview": async () => (await import("./inview")).vInview,
  "data-scroll-progress": async () => (await import("./scroll-progress")).vScrollProgress,
  "data-pointer": async () => (await import("./pointer")).vPointer,
  "data-count-up": async () => (await import("./count-up")).vCountUp,
  "data-countdown": async () => (await import("./countdown")).vCountdown,
  "data-copy": async () => (await import("./copy")).vCopy,
  "data-marquee": async () => (await import("./marquee")).vMarquee,
};

const loadedBehaviors = new Map<BehaviorType, BehaviorDirectiveType>();
const pendingBehaviors = new Map<BehaviorType, Promise<BehaviorDirectiveType | undefined>>();
const lazyDirectives = new Map<BehaviorType, BehaviorDirectiveType>();

export function isBehaviorAttribute(name: string): name is BehaviorType {
  return (BEHAVIOR_ATTRIBUTES as readonly string[]).includes(name);
}

export function preloadBehaviors(types: Iterable<BehaviorType>): void {
  for (const type of types) {
    void loadBehavior(type);
  }
}

/** Applies the behavior once its chunk is there; an element gone by then is left alone. */
export function getBehaviorDirective(type: BehaviorType): BehaviorDirectiveType {
  let directive = lazyDirectives.get(type);

  if (!directive) {
    directive = createLazyDirective(type);
    lazyDirectives.set(type, directive);
  }

  return directive;
}

function loadBehavior(type: BehaviorType): Promise<BehaviorDirectiveType | undefined> {
  let pending = pendingBehaviors.get(type);

  if (!pending) {
    pending = importBehavior(type);
    pendingBehaviors.set(type, pending);
  }

  return pending;
}

async function importBehavior(type: BehaviorType): Promise<BehaviorDirectiveType | undefined> {
  try {
    const directive = await BEHAVIOR_LOADERS[type]();
    loadedBehaviors.set(type, directive);
    return directive;
  } catch (error) {
    ignoreChunkLoadFailure(error);
    Logger.error(`[custom-sections] Failed to load the ${type} behavior`, error);
    pendingBehaviors.delete(type);
    return undefined;
  }
}

function createLazyDirective(type: BehaviorType): BehaviorDirectiveType {
  type MountArgumentsType = Parameters<NonNullable<BehaviorDirectiveType["mounted"]>>;

  /** The latest binding of an element mounted before its behavior loaded. */
  const waiting = new WeakMap<HTMLElement, MountArgumentsType>();

  async function mountWhenLoaded(element: HTMLElement): Promise<void> {
    const directive = await loadBehavior(type);
    const args = waiting.get(element);

    if (directive && args) {
      waiting.delete(element);
      directive.mounted?.(...args);
    }
  }

  return {
    mounted(element, binding, vnode, prevVNode) {
      const directive = loadedBehaviors.get(type);

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

      loadedBehaviors.get(type)?.updated?.(element, binding, vnode, prevVNode);
    },
    unmounted(element, binding, vnode, prevVNode) {
      if (!waiting.delete(element)) {
        loadedBehaviors.get(type)?.unmounted?.(element, binding, vnode, prevVNode);
      }
    },
  };
}
