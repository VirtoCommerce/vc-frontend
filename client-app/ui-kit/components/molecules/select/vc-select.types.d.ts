declare global {
  /** Emitted value: an array in multiple mode, otherwise a value or `undefined` (cleared). */
  type VcSelectEmittedType<V, M extends boolean> = M extends true ? V[] : V | undefined;

  /** Property name, or an accessor function, resolving a field of an option. */
  type VcSelectFieldAccessorType<T, R> = string | ((item: T) => R);
}

export {};
