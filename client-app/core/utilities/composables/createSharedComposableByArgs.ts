import { createSharedComposable, tryOnScopeDispose } from "@vueuse/core";

/**
 * Create a shared composable whose state is isolated per unique arguments tuple.
 * Uses a resolver (default: JSON.stringify) to create a cache key, and delegates
 * scoping/state caching to VueUse's `createSharedComposable`.
 */
export function createSharedComposableByArgs<Args extends unknown[], R>(
  composable: (...args: Args) => R,
): (...args: Args) => R {
  interface IEntry {
    subscribers: number;
    shared: () => R;
  }

  const entries = new Map<string, IEntry>();

  const wrapped = (...args: Args): R => {
    let key: string;
    try {
      key = JSON.stringify(args);
    } catch {
      key = String(args);
    }
    let entry = entries.get(key);
    if (!entry) {
      const factory: () => R = () => composable(...args);
      const shared = createSharedComposable<() => R>(factory);
      entry = { subscribers: 0, shared };
      entries.set(key, entry);
    }

    entry.subscribers += 1;

    tryOnScopeDispose(() => {
      const current = entries.get(key);
      if (!current) {
        return;
      }
      current.subscribers -= 1;
      if (current.subscribers <= 0) {
        entries.delete(key);
      }
    });

    return entry.shared();
  };

  return wrapped;
}
