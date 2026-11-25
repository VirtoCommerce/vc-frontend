export interface ILruCache<K, V> {
  has(key: K): boolean;
  /** Counts as a use. */
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

/** Holds at most `max` entries: the one used least recently goes first, so what is still shown stays. */
export function createLruCache<K, V>(max: number): ILruCache<K, V> {
  const entries = new Map<K, V>();

  return {
    has: (key) => entries.has(key),
    get(key) {
      if (!entries.has(key)) {
        return undefined;
      }

      const value = entries.get(key) as V;
      entries.delete(key);
      entries.set(key, value);
      return value;
    },
    set(key, value) {
      if (!entries.has(key) && entries.size >= max) {
        const [oldest] = entries.keys();
        entries.delete(oldest);
      }

      entries.delete(key);
      entries.set(key, value);
    },
  };
}
